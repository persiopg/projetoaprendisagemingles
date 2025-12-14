import argparse
import os
import re
import sys
import tarfile
import urllib.request
from dataclasses import dataclass
from pathlib import Path

import argostranslate.package
import argostranslate.translate


RE_WORD = re.compile(r"[A-Za-z]+(?:[-'][A-Za-z]+)*")


@dataclass(frozen=True)
class BestSentence:
    sentence_id: int
    text: str
    score: tuple


def ensure_argos_en_to_pt_installed() -> None:
    installed_languages = argostranslate.translate.get_installed_languages()
    installed_codes = {(l.code) for l in installed_languages}

    # Se as línguas não estiverem nem instaladas, tentamos instalar via índice de pacotes.
    # Em alguns ambientes a instalação de idiomas é lazy, então tentamos diretamente.
    try:
        translation = argostranslate.translate.get_translation_from_codes("en", "pt")
        if translation is not None:
            return
    except Exception:
        pass

    argostranslate.package.update_package_index()
    packages = argostranslate.package.get_available_packages()
    candidates = [p for p in packages if p.from_code == "en" and p.to_code == "pt"]
    if not candidates:
        raise RuntimeError("Não encontrei pacote Argos EN→PT disponível no índice.")

    pkg = candidates[0]
    download_path = pkg.download()
    argostranslate.package.install_from_path(download_path)


def translate_en_to_pt(text: str) -> str:
    translation = argostranslate.translate.get_translation_from_codes("en", "pt")
    if translation is None:
        raise RuntimeError("Tradução EN→PT não disponível no Argos (pacote não instalado).")
    return translation.translate(text)


def download_if_missing(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return
    print(f"Baixando {url} → {dest}")
    with urllib.request.urlopen(url) as resp:
        with open(dest, "wb") as f:
            f.write(resp.read())


def extract_words_from_words_ts(words_ts: str) -> list[str]:
    return [m.group(1).strip() for m in re.finditer(r'"([^"\n]+)"', words_ts) if m.group(1).strip()]


def find_member(tar: tarfile.TarFile, preferred_names: list[str]) -> tarfile.TarInfo:
    members = tar.getmembers()
    member_by_name = {m.name: m for m in members}
    for name in preferred_names:
        if name in member_by_name:
            return member_by_name[name]

    # fallback: procura por sufixos comuns
    for m in members:
        lower = m.name.lower()
        if any(lower.endswith(n) for n in preferred_names):
            return m

    raise FileNotFoundError(f"Não encontrei membro no tar. Esperado um de: {preferred_names}. Disponíveis: {[m.name for m in members[:20]]}...")


def iter_tsv_lines_from_tar_bz2(tar_path: Path, preferred_member_names: list[str]):
    with tarfile.open(tar_path, mode="r:bz2") as tar:
        member = find_member(tar, preferred_member_names)
        f = tar.extractfile(member)
        if f is None:
            raise RuntimeError(f"Falha ao extrair {member.name} de {tar_path}")

        for raw in f:
            line = raw.decode("utf-8", errors="replace").rstrip("\n")
            if line:
                yield line


def score_sentence(text: str, sentence_id: int) -> tuple:
    cleaned = text.strip()
    length = len(cleaned)
    has_digit = any(ch.isdigit() for ch in cleaned)

    # Heurística simples: frases muito curtas/longas e com números tendem a ser piores.
    length_penalty = 0
    if length < 15:
        length_penalty += 2
    elif length < 25:
        length_penalty += 1
    elif length > 110:
        length_penalty += 2
    elif length > 80:
        length_penalty += 1

    digit_penalty = 1 if has_digit else 0

    # Ordenação: menor penalidade, menor tamanho, menor id
    return (length_penalty, digit_penalty, length, sentence_id)


def ts_escape(s: str) -> str:
    return (
        s.replace("\\", "\\\\")
        .replace("`", "\\`")
        .replace("\r", "")
        .replace("\t", "\\t")
        .replace("\n", "\\n")
        .replace('"', '\\"')
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root",
        default=str(Path(__file__).resolve().parents[1]),
        help="Caminho para a pasta web/",
    )
    args = parser.parse_args()

    web_root = Path(args.root)
    words_path = web_root / "src" / "data" / "mostCommonEnglishWords2000.words.ts"
    out_path = web_root / "src" / "data" / "mostCommonEnglishWords2000.generatedOverrides.ts"

    data_dir = web_root / "data" / "tatoeba"
    sentences_tar = data_dir / "sentences.tar.bz2"
    links_tar = data_dir / "links.tar.bz2"

    if not words_path.exists():
        print(f"Arquivo não encontrado: {words_path}", file=sys.stderr)
        return 2

    ensure_argos_en_to_pt_installed()

    # Downloads
    download_if_missing("https://downloads.tatoeba.org/exports/sentences.tar.bz2", sentences_tar)
    download_if_missing("https://downloads.tatoeba.org/exports/links.tar.bz2", links_tar)

    # Base words
    words = extract_words_from_words_ts(words_path.read_text(encoding="utf-8"))
    words_lower = [w.lower() for w in words]
    words_set = set(words_lower)

    # Passo 1: varrer frases EN e escolher melhor por palavra.
    best_by_word: dict[str, BestSentence] = {}
    en_ids_needed: set[int] = set()

    for line in iter_tsv_lines_from_tar_bz2(sentences_tar, ["sentences.csv", "sentences.tsv", "sentences"]):
        parts = line.split("\t")
        if len(parts) < 3:
            continue

        try:
            sentence_id = int(parts[0])
        except ValueError:
            continue

        lang = parts[1]
        if lang != "eng":
            continue

        text = parts[2]
        tokens = {t.lower() for t in RE_WORD.findall(text)}
        matched = tokens & words_set
        if not matched:
            continue

        score = score_sentence(text, sentence_id)
        for token in matched:
            current = best_by_word.get(token)
            if current is None or score < current.score:
                best_by_word[token] = BestSentence(sentence_id=sentence_id, text=text, score=score)

    for w in words_lower:
        if w in best_by_word:
            en_ids_needed.add(best_by_word[w].sentence_id)

    # Passo 2: criar conjuntos de ids EN escolhidos e ids PT existentes (para filtrar links).
    pt_ids: set[int] = set()
    pt_by_id: dict[int, str] = {}

    for line in iter_tsv_lines_from_tar_bz2(sentences_tar, ["sentences.csv", "sentences.tsv", "sentences"]):
        parts = line.split("\t")
        if len(parts) < 3:
            continue

        try:
            sentence_id = int(parts[0])
        except ValueError:
            continue

        lang = parts[1]
        if lang != "por":
            continue

        text = parts[2]
        pt_ids.add(sentence_id)
        pt_by_id[sentence_id] = text

    # Passo 3: para cada EN escolhido, pegar 1 tradução PT humana se existir.
    pt_by_en_id: dict[int, str] = {}

    def consider_translation(en_id: int, pt_id: int) -> None:
        if en_id not in en_ids_needed:
            return
        if pt_id not in pt_ids:
            return
        pt_text = pt_by_id.get(pt_id)
        if not pt_text:
            return

        current = pt_by_en_id.get(en_id)
        if current is None or len(pt_text) < len(current):
            pt_by_en_id[en_id] = pt_text

    for line in iter_tsv_lines_from_tar_bz2(links_tar, ["links.csv", "links.tsv", "links"]):
        parts = line.split("\t")
        if len(parts) < 2:
            continue
        try:
            a = int(parts[0])
            b = int(parts[1])
        except ValueError:
            continue

        # o arquivo contém ligações recíprocas, então basta checar os dois sentidos.
        consider_translation(a, b)
        consider_translation(b, a)

    # Passo 4: montar overrides completos (2000/2000)
    missing_en = 0
    missing_en_words: list[str] = []
    used_human_pt = 0
    used_argos_pt = 0

    overrides_lines: list[str] = []
    for original_word, w in zip(words, words_lower, strict=True):
        best = best_by_word.get(w)
        if best is None:
            missing_en += 1
            missing_en_words.append(w)
            example_en = f'I saw the word "{original_word}" today.'
            context = "Argos Translate (offline) + frase template"
            example_pt = translate_en_to_pt(example_en)
        else:
            example_en = best.text
            en_id = best.sentence_id
            human_pt = pt_by_en_id.get(en_id)
            if human_pt:
                used_human_pt += 1
                example_pt = human_pt
                context = "Tatoeba (tradução humana eng→por)"
            else:
                used_argos_pt += 1
                example_pt = translate_en_to_pt(example_en)
                context = "Tatoeba (frase) + Argos Translate (offline)"

        translation_pt = translate_en_to_pt(original_word)

        overrides_lines.append(
            "    \"" + ts_escape(w) + "\": {\n"
            + "      translationPtBr: \"" + ts_escape(translation_pt) + "\",\n"
            + "      exampleEn: \"" + ts_escape(example_en) + "\",\n"
            + "      examplePtBr: \"" + ts_escape(example_pt) + "\",\n"
            + "      context: \"" + ts_escape(context) + "\",\n"
            + "    },"
        )

    out = (
        "// Arquivo gerado automaticamente. Não edite manualmente.\n"
        "// Fonte de frases: Tatoeba (https://tatoeba.org)\n"
        "// Tradução (fallback): Argos Translate (offline)\n\n"
        "import type { MostCommonEnglishWordEntryOverride } from \"./mostCommonEnglishWords2000.types\";\n\n"
        "export const MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES: Record<string, MostCommonEnglishWordEntryOverride> = {\n"
        + "\n".join(overrides_lines)
        + "\n};\n"
    )

    out_path.write_text(out, encoding="utf-8")

    print(
        "OK: gerado "
        + str(out_path)
        + f" | base={len(words_lower)} humanPT={used_human_pt} argosPT={used_argos_pt} missingEN={missing_en}"
    )

    if missing_en_words:
        print("Palavras sem frase no Tatoeba (usando template), até 50:")
        print(", ".join(sorted(missing_en_words)[:50]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
