import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const webRoot = path.resolve(import.meta.dirname, "..");

const WORDS_FILE = path.resolve(webRoot, "src", "data", "mostCommonEnglishWords2000.words.ts");
const MANUAL_OVERRIDES_FILE = path.resolve(
  webRoot,
  "src",
  "data",
  "mostCommonEnglishWords2000.manualOverrides.ts",
);
const WIKTIONARY_JSONL = path.resolve(webRoot, "data", "wiktionary", "kaikki.org-dictionary-English.jsonl");
const OUTPUT_FILE = path.resolve(
  webRoot,
  "src",
  "data",
  "mostCommonEnglishWords2000.generatedOverrides.ts",
);

function normalizeWord(word) {
  return word.trim().toLowerCase();
}

function compactSpaces(text) {
  return text.replace(/\s+/g, " ").trim();
}

function extractWordsFromWordsTs(fileContent) {
  const words = [];
  const regex = /"([^"]+)"/g;
  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    words.push(match[1]);
  }
  return words;
}

function extractKeysFromOverridesTs(fileContent) {
  const keys = new Set();
  const lines = fileContent.split(/\r?\n/);
  const keyRegex = /^\s*(?:([A-Za-z0-9_$-]+)|(["'])(.*?)\2)\s*:\s*\{/;
  for (const line of lines) {
    const match = keyRegex.exec(line);
    if (!match) continue;
    const ident = match[1];
    const quoted = match[3];
    const key = (ident ?? quoted ?? "").trim();
    if (key) keys.add(normalizeWord(key));
  }
  return keys;
}

function posToPtBr(pos) {
  switch ((pos || "").toLowerCase()) {
    case "noun":
      return "Substantivo";
    case "verb":
      return "Verbo";
    case "adjective":
      return "Adjetivo";
    case "adverb":
      return "Advérbio";
    case "pronoun":
      return "Pronome";
    case "preposition":
      return "Preposição";
    case "conjunction":
      return "Conjunção";
    case "interjection":
      return "Interjeição";
    case "determiner":
      return "Determinante";
    case "numeral":
      return "Numeral";
    default:
      return "Uso";
  }
}

function pickTranslationPtFromTranslations(translations) {
  if (!Array.isArray(translations)) return [];

  const candidates = [];
  for (const t of translations) {
    if (!t || typeof t !== "object") continue;
    const lang = (t.lang || "").toString().toLowerCase();
    const langCode = (t.lang_code || t.code || "").toString().toLowerCase();

    const isPortuguese =
      langCode === "pt" ||
      lang.includes("portugu") ||
      (t.lang && t.lang === "Portuguese");

    if (!isPortuguese) continue;
    const w = typeof t.word === "string" ? t.word : "";
    const cleaned = compactSpaces(w);
    if (!cleaned) continue;
    candidates.push(cleaned);
  }

  return candidates;
}

function pickTranslationPtFromEntry(entry) {
  const rootCandidates = pickTranslationPtFromTranslations(entry?.translations);
  const senseCandidates = (entry?.senses || [])
    .flatMap((s) => pickTranslationPtFromTranslations(s?.translations))
    .filter(Boolean);

  const candidates = [...rootCandidates, ...senseCandidates];

  const unique = [];
  const seen = new Set();
  for (const c of candidates) {
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(c);
    if (unique.length >= 3) break;
  }

  if (unique.length === 0) return null;
  return unique.join(", ");
}

function pickExampleEnFromSenses(senses) {
  if (!Array.isArray(senses)) return null;
  for (const s of senses) {
    const examples = s?.examples;
    if (!Array.isArray(examples)) continue;
    for (const ex of examples) {
      const text = typeof ex?.text === "string" ? compactSpaces(ex.text) : "";
      if (!text) continue;
      if (text.includes("\n")) continue;
      if (text.length > 160) continue;
      const type = (ex?.type || "").toString().toLowerCase();
      if (type && type !== "example") continue;
      return text;
    }
  }
  return null;
}

function primaryTranslationWord(translationPtBr) {
  // Pega a primeira alternativa (antes de vírgula) e remove parênteses.
  const first = translationPtBr.split(",")[0] ?? translationPtBr;
  return compactSpaces(first).replace(/\s*\([^)]*\)\s*/g, " ").trim();
}

function buildFallbackExamples({ word, pos, translationPtBr }) {
  const t = primaryTranslationWord(translationPtBr);
  const p = (pos || "").toLowerCase();

  if (p === "verb") {
    return {
      exampleEn: `I will ${word} today.`,
      examplePtBr: `Eu vou ${t.toLowerCase()} hoje.`,
    };
  }

  if (p === "adjective") {
    return {
      exampleEn: `It is very ${word}.`,
      examplePtBr: `Isso é muito ${t.toLowerCase()}.`,
    };
  }

  if (p === "adverb") {
    return {
      exampleEn: `Do it ${word}.`,
      examplePtBr: `Faça isso ${t.toLowerCase()}.`,
    };
  }

  // noun e default
  const article = /^[aeiou]/i.test(word) ? "an" : "a";
  return {
    exampleEn: `I need ${article} ${word}.`,
    examplePtBr: `Eu preciso de ${t.toLowerCase()}.`,
  };
}

function buildContext({ pos, translationPtBr }) {
  const posPtBr = posToPtBr(pos);
  const t = primaryTranslationWord(translationPtBr);
  if (posPtBr === "Uso") return `Uso comum: geralmente “${t}”.`;
  return `${posPtBr}: geralmente “${t}”.`;
}

function isSimpleAlpha(word) {
  return /^[a-z]+$/.test(word);
}

function candidateLookupForms(baseWord) {
  const w = normalizeWord(baseWord);
  const forms = new Set([w]);
  if (!isSimpleAlpha(w) || w.length < 4) return [...forms];

  // plural
  if (w.endsWith("ies") && w.length > 4) forms.add(w.slice(0, -3) + "y");
  if (w.endsWith("es") && w.length > 4) forms.add(w.slice(0, -2));
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 4) forms.add(w.slice(0, -1));

  // past
  if (w.endsWith("ied") && w.length > 4) forms.add(w.slice(0, -3) + "y");
  if (w.endsWith("ed") && w.length > 4) forms.add(w.slice(0, -2));
  if (w.endsWith("d") && w.length > 4) forms.add(w.slice(0, -1));

  // gerund
  if (w.endsWith("ing") && w.length > 5) forms.add(w.slice(0, -3));

  return [...forms];
}

function toTsStringLiteral(value) {
  return JSON.stringify(value);
}

function renderOverridesTs(overridesByWord, wordsInOrder) {
  const lines = [];

  lines.push('import "server-only";');
  lines.push("");
  lines.push('import type { MostCommonEnglishWordEntryOverride } from "./mostCommonEnglishWords2000.types";');
  lines.push("");
  lines.push("// Arquivo GERADO automaticamente.");
  lines.push("// Fonte (conteúdo/estrutura): dump offline do Wiktionary via Kaikki.org (CC BY-SA). ");
  lines.push("// Veja detalhes de atribuição em: web/ATTRIBUTION.md");
  lines.push("//\n// Regra: manual > gerado > vazio.");
  lines.push("export const MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES: Record<string, MostCommonEnglishWordEntryOverride> = {");

  for (const w of wordsInOrder) {
    const entry = overridesByWord.get(w);
    if (!entry) continue;

    lines.push(`  ${toTsStringLiteral(w)}: {`);
    lines.push(`    translationPtBr: ${toTsStringLiteral(entry.translationPtBr)},`);
    lines.push(`    exampleEn: ${toTsStringLiteral(entry.exampleEn)},`);
    lines.push(`    examplePtBr: ${toTsStringLiteral(entry.examplePtBr)},`);
    lines.push(`    context: ${toTsStringLiteral(entry.context)},`);
    lines.push("  },");
  }

  lines.push("};");
  lines.push("");

  return lines.join("\n");
}

async function main() {
  if (!fs.existsSync(WIKTIONARY_JSONL)) {
    console.error(`Dump não encontrado em: ${WIKTIONARY_JSONL}`);
    process.exitCode = 1;
    return;
  }

  const wordsTs = fs.readFileSync(WORDS_FILE, "utf8");
  const manualTs = fs.readFileSync(MANUAL_OVERRIDES_FILE, "utf8");

  const words = extractWordsFromWordsTs(wordsTs);
  const targetWords = new Set(words.map(normalizeWord));
  const manualKeys = extractKeysFromOverridesTs(manualTs);

  const remaining = new Set([...targetWords].filter((w) => !manualKeys.has(w)));
  const overrides = new Map();

  // Mapa: forma de lookup no dump -> quais palavras base podemos preencher com ela.
  const lookupToTargets = new Map();
  for (const baseWord of remaining) {
    for (const lookup of candidateLookupForms(baseWord)) {
      const list = lookupToTargets.get(lookup) ?? [];
      list.push(baseWord);
      lookupToTargets.set(lookup, list);
    }
  }

  let totalLines = 0;
  let parsed = 0;
  let matchedWord = 0;
  let generated = 0;
  let skippedNoPt = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(WIKTIONARY_JSONL, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    totalLines += 1;
    if (!line) continue;

    let obj;
    try {
      obj = JSON.parse(line);
      parsed += 1;
    } catch {
      continue;
    }

    if (obj?.lang_code !== "en") continue;

    const wordRaw = obj?.word ?? obj?.headword;
    if (typeof wordRaw !== "string") continue;

    const entryWord = normalizeWord(wordRaw);
    const targetsForThisEntry = lookupToTargets.get(entryWord);
    if (!targetsForThisEntry || targetsForThisEntry.length === 0) continue;

    // Vamos tentar preencher 1+ palavras base a partir desta entrada.
    // Regra: só preenche se a palavra base ainda estiver faltando.
    const translationPtBr = pickTranslationPtFromEntry(obj);
    if (!translationPtBr) {
      skippedNoPt += 1;
      continue;
    }

    const exampleEnFromDump = pickExampleEnFromSenses(obj?.senses);

    for (const targetWord of targetsForThisEntry) {
      if (!remaining.has(targetWord)) continue;
      matchedWord += 1;

      const { exampleEn: exampleEnFallback, examplePtBr } = buildFallbackExamples({
        word: targetWord,
        pos: obj?.pos,
        translationPtBr,
      });

      const entry = {
        translationPtBr,
        exampleEn: exampleEnFromDump ?? exampleEnFallback,
        examplePtBr,
        context: buildContext({ pos: obj?.pos, translationPtBr }),
      };

      overrides.set(targetWord, entry);
      remaining.delete(targetWord);
      generated += 1;
    }

    if (remaining.size === 0) {
      break;
    }

    // Log leve a cada ~200 entradas geradas
    if (generated % 200 === 0) {
      console.log(`Geradas ${generated} entradas... faltando ${remaining.size}`);
    }
  }

  const out = renderOverridesTs(overrides, words.map(normalizeWord));
  fs.writeFileSync(OUTPUT_FILE, out, "utf8");

  console.log("\nResumo:");
  console.log(`- Words base: ${words.length}`);
  console.log(`- Manual overrides: ${manualKeys.size}`);
  console.log(`- Linhas lidas: ${totalLines}`);
  console.log(`- JSON parseados: ${parsed}`);
  console.log(`- Matches (palavra na base e sem manual): ${matchedWord}`);
  console.log(`- Geradas (com tradução PT): ${generated}`);
  console.log(`- Puladas (sem tradução PT detectável): ${skippedNoPt}`);
  console.log(`- Ainda faltando (sem manual e sem gerado): ${remaining.size}`);
  console.log(`\nArquivo gerado: ${path.relative(repoRoot, OUTPUT_FILE)}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
