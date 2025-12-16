import argparse
import re
import sys
import tarfile
import time
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


def insert_top_k(best_list: list[BestSentence], candidate: BestSentence, k: int) -> None:
    best_list.append(candidate)
    best_list.sort(key=lambda s: s.score)
    if len(best_list) > k:
        del best_list[k:]


def ensure_argos_en_to_pt_installed() -> None:
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

    part_path = dest.with_name(dest.name + ".part")
    existing_path = dest if dest.exists() else part_path
    existing_size = existing_path.stat().st_size if existing_path.exists() else 0

    remote_size: int | None = None
    try:
        head_req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(head_req, timeout=60) as head_resp:
            remote_size_header = head_resp.headers.get("Content-Length")
            if remote_size_header and remote_size_header.isdigit():
                remote_size = int(remote_size_header)
    except Exception:
        remote_size = None

    # Se já temos o arquivo completo, não faz nada.
    if dest.exists() and dest.stat().st_size > 0 and (remote_size is None or dest.stat().st_size == remote_size):
        return

    # Se temos um .part e ele já bate com o tamanho remoto, finaliza renomeando.
    if part_path.exists() and part_path.stat().st_size > 0 and remote_size is not None and part_path.stat().st_size == remote_size:
        part_path.replace(dest)
        return

    resume_from = part_path.stat().st_size if part_path.exists() else 0

    if remote_size is not None and resume_from > remote_size:
        part_path.unlink(missing_ok=True)
        resume_from = 0

    print(f"Baixando {url} → {dest}{' (retomando)' if resume_from else ''}")
    req = urllib.request.Request(url)
    if resume_from:
        req.add_header("Range", f"bytes={resume_from}-")

    last_report = time.time()
    bytes_since_report = 0
    chunk_size = 1024 * 1024  # 1 MiB

    with urllib.request.urlopen(req, timeout=60) as resp:
        # Se o servidor ignorar Range e devolver o arquivo inteiro, reinicia do zero.
        content_range = resp.headers.get("Content-Range")
        if resume_from and not content_range:
            resume_from = 0
            part_path.unlink(missing_ok=True)

        mode = "ab" if resume_from else "wb"
        with open(part_path, mode) as f:
            while True:
                chunk = resp.read(chunk_size)
                if not chunk:
                    break
                f.write(chunk)

                bytes_since_report += len(chunk)
                now = time.time()
                if now - last_report >= 10:
                    current_size = part_path.stat().st_size
                    if remote_size:
                        pct = (current_size / remote_size) * 100
                        print(f"  ... {current_size}/{remote_size} bytes ({pct:.1f}%)")
                    else:
                        print(f"  ... {current_size} bytes")
                    last_report = now
                    bytes_since_report = 0

    if remote_size is not None and part_path.stat().st_size != remote_size:
        raise RuntimeError(
            f"Download incompleto de {url}: {part_path.stat().st_size} != {remote_size}. Tente rodar novamente para retomar."
        )

    part_path.replace(dest)


def extract_words_from_words_ts(words_ts: str) -> list[str]:
    return [m.group(1).strip() for m in re.finditer(r'"([^"\n]+)"', words_ts) if m.group(1).strip()]


def find_member(tar: tarfile.TarFile, preferred_names: list[str]) -> tarfile.TarInfo:
    members = tar.getmembers()
    member_by_name = {m.name: m for m in members}
    for name in preferred_names:
        if name in member_by_name:
            return member_by_name[name]

    for m in members:
        lower = m.name.lower()
        if any(lower.endswith(n) for n in preferred_names):
            return m

    raise FileNotFoundError(
        f"Não encontrei membro no tar. Esperado um de: {preferred_names}. Disponíveis: {[m.name for m in members[:20]]}..."
    )


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

    download_if_missing("https://downloads.tatoeba.org/exports/sentences.tar.bz2", sentences_tar)
    download_if_missing("https://downloads.tatoeba.org/exports/links.tar.bz2", links_tar)

    words = extract_words_from_words_ts(words_path.read_text(encoding="utf-8"))
    words_lower = [w.lower() for w in words]
    words_set = set(words_lower)

    candidate_k = 12
    best_by_word: dict[str, list[BestSentence]] = {}
    candidate_en_ids: set[int] = set()

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
        candidate = BestSentence(sentence_id=sentence_id, text=text, score=score)
        for token in matched:
            lst = best_by_word.get(token)
            if lst is None:
                lst = []
                best_by_word[token] = lst
            insert_top_k(lst, candidate, k=candidate_k)

    for w in words_lower:
        if w in best_by_word:
            for s in best_by_word[w]:
                candidate_en_ids.add(s.sentence_id)

    # Carrega links relevantes (para economizar memória, só ids conectados a frases EN candidatas).
    linked_ids_by_en: dict[int, set[int]] = {}
    candidate_linked_ids: set[int] = set()
    for line in iter_tsv_lines_from_tar_bz2(links_tar, ["links.csv", "links.tsv", "links"]):
        parts = line.split("\t")
        if len(parts) < 2:
            continue
        try:
            a = int(parts[0])
            b = int(parts[1])
        except ValueError:
            continue

        if a in candidate_en_ids:
            linked_ids_by_en.setdefault(a, set()).add(b)
            candidate_linked_ids.add(b)
        if b in candidate_en_ids:
            linked_ids_by_en.setdefault(b, set()).add(a)
            candidate_linked_ids.add(a)

    # Agora carrega só as frases PT cujo ID aparece nos links das candidatas EN.
    pt_by_id: dict[int, str] = {}
    for line in iter_tsv_lines_from_tar_bz2(sentences_tar, ["sentences.csv", "sentences.tsv", "sentences"]):
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        try:
            sentence_id = int(parts[0])
        except ValueError:
            continue
        if sentence_id not in candidate_linked_ids:
            continue
        lang = parts[1]
        if lang != "por":
            continue
        text = parts[2]
        pt_by_id[sentence_id] = text

    # Monta melhor tradução humana (quando existir) por EN-id.
    pt_by_en_id: dict[int, str] = {}
    for en_id, linked_ids in linked_ids_by_en.items():
        best: str | None = None
        for linked_id in linked_ids:
            pt_text = pt_by_id.get(linked_id)
            if not pt_text:
                continue
            if best is None or len(pt_text) < len(best):
                best = pt_text
        if best is not None:
            pt_by_en_id[en_id] = best

    missing_en = 0
    missing_en_words: list[str] = []
    used_human_pt = 0
    used_argos_pt = 0

    argos_cache: dict[str, str] = {}

    def translate_cached(text: str) -> str:
        cached = argos_cache.get(text)
        if cached is not None:
            return cached
        translated = translate_en_to_pt(text)
        argos_cache[text] = translated
        return translated

    overrides_lines: list[str] = []
    for original_word, w in zip(words, words_lower, strict=True):
        candidates = best_by_word.get(w) or []
        example_ens: list[str] = []
        example_pts: list[str] = []

        used_any_human = False
        used_any_argos = False

        if not candidates:
            missing_en += 1
            missing_en_words.append(w)
            context = "Sem frase EN encontrada no Tatoeba"
        else:
            # Primeiro tenta traduções humanas (via links)
            for s in candidates:
                if len(example_ens) >= 3:
                    break
                human_pt = pt_by_en_id.get(s.sentence_id)
                if not human_pt:
                    continue
                used_human_pt += 1
                used_any_human = True
                example_ens.append(s.text)
                example_pts.append(human_pt)

            # Se ainda faltou, completa com as frases restantes usando Argos
            if len(example_ens) < 3:
                for s in candidates:
                    if len(example_ens) >= 3:
                        break
                    if s.text in example_ens:
                        continue
                    used_argos_pt += 1
                    used_any_argos = True
                    example_ens.append(s.text)
                    example_pts.append(translate_cached(s.text))

            if used_any_human and used_any_argos:
                context = "Tatoeba (parcial eng→por) + Argos Translate (fallback offline)"
            elif used_any_human:
                context = "Tatoeba (tradução humana eng→por)"
            else:
                context = "Tatoeba (frase) + Argos Translate (offline)"

        # Garante 3/3 sem inventar frases novas: duplica o último par existente.
        while len(example_ens) > 0 and len(example_ens) < 3:
            example_ens.append(example_ens[-1])
            example_pts.append(example_pts[-1])

        translation_pt = translate_cached(original_word)

        overrides_lines.append(
            "    \"" + ts_escape(w) + "\": {\n"
            + "      translationPtBr: \"" + ts_escape(translation_pt) + "\",\n"
            + "      exampleEn: [" + ", ".join(["\"" + ts_escape(x) + "\"" for x in example_ens]) + "],\n"
            + "      examplePtBr: [" + ", ".join(["\"" + ts_escape(x) + "\"" for x in example_pts]) + "],\n"
            + "      context: \"" + ts_escape(context) + "\",\n"
            + "    },"
        )

    out = (
        "// Arquivo gerado automaticamente. Não edite manualmente.\n"
        "// Fonte de frases: Tatoeba (https://tatoeba.org)\n"
        "// Tradução (fallback): Argos Translate (offline)\n\n"
        'import type { MostCommonEnglishWordEntryOverride } from "./mostCommonEnglishWords2000.types";\n\n'
        "export const MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES: Record<string, MostCommonEnglishWordEntryOverride> = {\n"
        + "\n".join(overrides_lines)
        + "\n};\n"
    )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(out, encoding="utf-8")

    print(
        "OK: gerado "
        + str(out_path)
        + f" | base={len(words_lower)} humanPT={used_human_pt} argosPT={used_argos_pt} missingEN={missing_en}"
    )

    if missing_en_words:
        print("Palavras sem frase no Tatoeba (até 50):")
        print(", ".join(sorted(missing_en_words)[:50]))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
