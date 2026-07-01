import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const INPUT_WORDS_FILE = path.join(
  ROOT,
  "node_modules",
  "most-common-words-by-language",
  "build",
  "resources",
  "english.txt",
);

const OUTPUT_WORDS_TS_FILE = path.join(
  ROOT,
  "src",
  "data",
  "mostCommonEnglishWords2000.words.ts",
);

const WORDS_TO_IGNORE = new Set([
  // Estrangeirismos de outras línguas vazados
  "de", "la", "el", "en", "al", "las", "un", "os", "con", "se", "para", "por", "del", "les", "des",
  // Termos e siglas técnicas/web de baixo valor
  "html", "http", "www", "com", "net", "org", "pdf", "gif", "jpg", "jpeg", "png", "amp", "xml", "rss", "css", "url",
  "ebay", "yahoo", "microsoft", "google", "adobe", "copyright", "php", "javascript", "sql", "click", "online", "website",
  "email", "link", "post", "blog", "posts", "sites", "links", "blogs", "users", "faq", "wiki"
]);

function loadWords2000(limit = 2000) {
  const raw = readFileSync(INPUT_WORDS_FILE, "utf8");

  const keepSingleLetter = new Set(["a", "i"]);
  const seen = new Set();
  const out = [];

  for (const line of raw.split(/\r?\n/)) {
    const word = line.trim();
    if (!word) continue;

    const lower = word.toLowerCase();

    // Filtro 1: letras únicas que não sejam 'a' ou 'i'
    if (lower.length === 1 && !keepSingleLetter.has(lower)) continue;

    // Filtro 2: termos de exclusão (estrangeirismos e web inúteis)
    if (WORDS_TO_IGNORE.has(lower)) continue;

    // Filtro 3: duplicadas exatas
    if (seen.has(lower)) continue;

    // Filtro 4: plurais redundantes simples
    let isRedundantPlural = false;
    if (lower.endsWith("s") && lower.length > 2) {
      const singular = lower.slice(0, -1);
      if (seen.has(singular)) {
        isRedundantPlural = true;
      }
    }
    if (lower.endsWith("es") && lower.length > 3) {
      const singular = lower.slice(0, -2);
      if (seen.has(singular)) {
        isRedundantPlural = true;
      }
    }
    if (isRedundantPlural) continue;

    seen.add(lower);
    out.push(lower);

    if (out.length >= limit) break;
  }

  return out;
}

function formatWordsTs(words) {
  const lines = [];
  lines.push("export const WORDS_EN_2000 = [");
  for (const w of words) {
    lines.push(`  ${JSON.stringify(w)},`);
  }
  lines.push("] as const;\n");
  return lines.join("\n");
}

const words = loadWords2000(2000);
if (words.length !== 2000) {
  throw new Error(`Expected 2000 words, got ${words.length}`);
}

writeFileSync(OUTPUT_WORDS_TS_FILE, formatWordsTs(words), "utf8");
console.log(`Wrote ${words.length} words to ${OUTPUT_WORDS_TS_FILE}`);
