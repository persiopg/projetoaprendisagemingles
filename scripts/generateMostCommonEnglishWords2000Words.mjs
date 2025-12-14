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

function loadWords2000(limit = 2000) {
  const raw = readFileSync(INPUT_WORDS_FILE, "utf8");

  const keepSingleLetter = new Set(["a", "i"]);
  const seen = new Set();
  const out = [];

  for (const line of raw.split(/\r?\n/)) {
    const word = line.trim();
    if (!word) continue;

    const lower = word.toLowerCase();
    if (lower.length === 1 && !keepSingleLetter.has(lower)) continue;

    if (seen.has(lower)) continue;
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
