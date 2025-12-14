import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function extractWordsFromWordsTs(text) {
  const matches = [...text.matchAll(/"([^"\n]+)"/g)];
  return matches.map((m) => m[1].trim()).filter(Boolean);
}

function extractKeysFromOverridesTs(text) {
  const keys = new Set();

  // Unquoted keys: foo: {
  for (const m of text.matchAll(/^\s*([A-Za-z0-9][A-Za-z0-9'\-]*)\s*:\s*\{/gm)) {
    keys.add(m[1].toLowerCase());
  }

  // Quoted keys: "foo-bar": {
  for (const m of text.matchAll(/^\s*["']([^"']+)["']\s*:\s*\{/gm)) {
    keys.add(m[1].toLowerCase());
  }

  return keys;
}

function main() {
  const repoRoot = path.join(import.meta.dirname, "..");
  const wordsPath = path.join(repoRoot, "src", "data", "mostCommonEnglishWords2000.words.ts");
  const overridesPath = path.join(repoRoot, "src", "data", "mostCommonEnglishWords2000.manualOverrides.ts");

  const overridesTxt = readFileSync(overridesPath, "utf8");
  const overrideKeys = extractKeysFromOverridesTs(overridesTxt);

  if (!existsSync(wordsPath)) {
    const estimatedMissing = Math.max(0, 2000 - overrideKeys.size);
    console.log(
      JSON.stringify(
        {
          baseCount: 2000,
          overrideKeyCount: overrideKeys.size,
          presentCount: overrideKeys.size,
          missingCount: estimatedMissing,
          note: "Base word list file not found on disk; missingCount is estimated as 2000 - overrideKeyCount.",
        },
        null,
        2,
      ),
    );
    return;
  }

  const wordsTxt = readFileSync(wordsPath, "utf8");
  const words = extractWordsFromWordsTs(wordsTxt).map((w) => w.toLowerCase());
  const baseSet = new Set(words);

  const present = [...baseSet].filter((w) => overrideKeys.has(w));
  const missing = [...baseSet].filter((w) => !overrideKeys.has(w));
  const extras = [...overrideKeys].filter((k) => !baseSet.has(k));

  console.log(
    JSON.stringify(
      {
        baseCount: baseSet.size,
        overrideKeyCount: overrideKeys.size,
        presentCount: present.length,
        missingCount: missing.length,
        extraOverrideKeysNotInBaseCount: extras.length,
      },
      null,
      2,
    ),
  );

  console.log("\nSample missing words (up to 30):");
  console.log(missing.sort().slice(0, 30).join(", "));
}

main();
