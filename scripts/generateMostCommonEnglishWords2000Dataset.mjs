import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// MyMemory é público e não precisa Docker nem chave.
// Observação: traduções são automáticas e podem variar.
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

const CONCURRENCY = Number.parseInt(process.env.CONCURRENCY || "2", 10);
const DELAY_MS = Number.parseInt(process.env.DELAY_MS || "250", 10);
const LIMIT = Number.parseInt(process.env.LIMIT || "2000", 10);

const CACHE_DIR = path.join(ROOT, ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "mostCommonEnglishWords2000.dataset.json");

const INPUT_WORDS_FILE = path.join(
  ROOT,
  "node_modules",
  "most-common-words-by-language",
  "build",
  "resources",
  "english.txt",
);

const OUTPUT_DATASET_TS_FILE = path.join(
  ROOT,
  "src",
  "data",
  "mostCommonEnglishWords2000.dataset.ts",
);
const OUTPUT_OVERRIDES_TS_FILE = path.join(
  ROOT,
  "src",
  "data",
  "mostCommonEnglishWords2000.fullOverrides.ts",
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateWordWithRetry(word, maxRetries = 6) {
  let attempt = 0;
  while (true) {
    try {
      const url = `${MYMEMORY_URL}?q=${encodeURIComponent(word)}&langpair=en|pt-br`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (typeof translated !== "string") {
        throw new Error("Unexpected MyMemory response shape");
      }
      return translated;
    } catch (err) {
      attempt += 1;
      if (attempt > maxRetries) throw err;

      const wait = Math.min(8000, 400 * 2 ** (attempt - 1));
      await sleep(wait);
    }
  }
}

async function translateWithRetry(text, maxRetries = 6) {
  return translateWordWithRetry(text, maxRetries);
}

function loadWords2000() {
  const raw = readFileSync(INPUT_WORDS_FILE, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, Math.min(2000, Math.max(1, LIMIT)));
}

const special = {
  the: {
    translationPtBr: "o/a (artigo definido)",
    exampleEn: "The book is on the table.",
    examplePtBr: "O livro está na mesa.",
    context: "Cotidiano (objeto/localização)",
  },
  and: {
    translationPtBr: "e",
    exampleEn: "I work and study at night.",
    examplePtBr: "Eu trabalho e estudo à noite.",
    context: "Cotidiano (rotina)",
  },
  to: {
    translationPtBr: "para / a (infinitivo)",
    exampleEn: "I want to learn English.",
    examplePtBr: "Eu quero aprender inglês.",
    context: "Estudos (objetivo)",
  },
  of: {
    translationPtBr: "de",
    exampleEn: "A cup of coffee, please.",
    examplePtBr: "Uma xícara de café, por favor.",
    context: "Cotidiano (pedido)",
  },
  in: {
    translationPtBr: "em",
    exampleEn: "She lives in São Paulo.",
    examplePtBr: "Ela mora em São Paulo.",
    context: "Cotidiano (localização)",
  },
  for: {
    translationPtBr: "para",
    exampleEn: "This is for you.",
    examplePtBr: "Isto é para você.",
    context: "Cotidiano (entrega)",
  },
  is: {
    translationPtBr: "é / está",
    exampleEn: "Today is a good day.",
    examplePtBr: "Hoje é um bom dia.",
    context: "Cotidiano (afirmação)",
  },
  on: {
    translationPtBr: "em cima de / sobre",
    exampleEn: "Your keys are on the desk.",
    examplePtBr: "Suas chaves estão em cima da mesa.",
    context: "Cotidiano (objetos)",
  },
  that: {
    translationPtBr: "que / aquele(a)",
    exampleEn: "I think that this is correct.",
    examplePtBr: "Eu acho que isso está correto.",
    context: "Trabalho/estudos (opinião)",
  },
  with: {
    translationPtBr: "com",
    exampleEn: "I’m going with my friend.",
    examplePtBr: "Eu vou com meu amigo.",
    context: "Cotidiano (companhia)",
  },
  i: {
    translationPtBr: "eu",
    exampleEn: "I am learning every day.",
    examplePtBr: "Eu estou aprendendo todos os dias.",
    context: "Estudos (rotina)",
  },
  you: {
    translationPtBr: "você",
    exampleEn: "You can do it.",
    examplePtBr: "Você consegue.",
    context: "Motivação (encorajamento)",
  },
  it: {
    translationPtBr: "isso/isto/ele/ela (neutro)",
    exampleEn: "It’s important to practice.",
    examplePtBr: "É importante praticar.",
    context: "Estudos (dica)",
  },
  not: {
    translationPtBr: "não",
    exampleEn: "I’m not ready yet.",
    examplePtBr: "Eu ainda não estou pronto(a).",
    context: "Cotidiano (negação)",
  },
  or: {
    translationPtBr: "ou",
    exampleEn: "Do you want tea or coffee?",
    examplePtBr: "Você quer chá ou café?",
    context: "Cotidiano (escolha)",
  },
  be: {
    translationPtBr: "ser / estar",
    exampleEn: "It’s good to be kind.",
    examplePtBr: "É bom ser gentil.",
    context: "Valores (comportamento)",
  },
  are: {
    translationPtBr: "são / estão",
    exampleEn: "They are at home.",
    examplePtBr: "Eles/Elas estão em casa.",
    context: "Cotidiano (localização)",
  },
  from: {
    translationPtBr: "de (origem)",
    exampleEn: "I’m from Brazil.",
    examplePtBr: "Eu sou do Brasil.",
    context: "Apresentação (origem)",
  },
  at: {
    translationPtBr: "em / no / na",
    exampleEn: "Meet me at 8 o’clock.",
    examplePtBr: "Encontre comigo às 8 horas.",
    context: "Cotidiano (horário)",
  },
  as: {
    translationPtBr: "como / como se",
    exampleEn: "Use this as an example.",
    examplePtBr: "Use isto como um exemplo.",
    context: "Estudos (explicação)",
  },
  your: {
    translationPtBr: "seu/sua",
    exampleEn: "What’s your name?",
    examplePtBr: "Qual é o seu nome?",
    context: "Apresentação (pergunta)",
  },
  all: {
    translationPtBr: "todo(s)/toda(s)",
    exampleEn: "All students are welcome.",
    examplePtBr: "Todos os alunos são bem-vindos.",
    context: "Escola (inclusão)",
  },
  have: {
    translationPtBr: "ter",
    exampleEn: "I have a question.",
    examplePtBr: "Eu tenho uma pergunta.",
    context: "Estudos (dúvida)",
  },
  more: {
    translationPtBr: "mais",
    exampleEn: "I need more time.",
    examplePtBr: "Eu preciso de mais tempo.",
    context: "Trabalho/estudos (prazo)",
  },
};

function buildGenericExample(word) {
  return `I learned the word "${word}" today.`;
}

function buildGenericExamplePtBr(word) {
  return `Eu aprendi a palavra "${word}" hoje.`;
}

function buildContext(word) {
  const key = word.toLowerCase();
  if (special[key]?.context) return special[key].context;
  return "Estudos (vocabulário)";
}

function buildExampleEn(word) {
  const key = word.toLowerCase();
  if (special[key]?.exampleEn) return special[key].exampleEn;
  return buildGenericExample(word);
}

function buildExamplePtBr(word) {
  const key = word.toLowerCase();
  if (special[key]?.examplePtBr) return special[key].examplePtBr;
  return buildGenericExamplePtBr(word);
}

function loadCache() {
  if (!existsSync(CACHE_FILE)) return {};
  try {
    const raw = readFileSync(CACHE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCache(cache) {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
}

async function runPool(items, worker, concurrency) {
  const queue = items.slice();
  const results = [];

  const runners = Array.from({ length: concurrency }, async () => {
    while (true) {
      const next = queue.shift();
      if (!next) break;
      const r = await worker(next);
      results.push(r);
    }
  });

  await Promise.all(runners);
  return results;
}

function toTsStringLiteral(value) {
  return JSON.stringify(value);
}

function writeDatasetTs(orderedEntries) {
  const header =
    "import \"server-only\";\n\n" +
    'import type { MostCommonEnglishWordEntry } from "./mostCommonEnglishWords2000.types";\n\n' +
    "export const MOST_COMMON_ENGLISH_WORDS_2000: MostCommonEnglishWordEntry[] = [\n";

  const body = orderedEntries
    .map((e) =>
      `  { word: ${toTsStringLiteral(e.word)}, translationPtBr: ${toTsStringLiteral(
        e.translationPtBr,
      )}, exampleEn: ${toTsStringLiteral(e.exampleEn)}, examplePtBr: ${toTsStringLiteral(
        e.examplePtBr,
      )}, context: ${toTsStringLiteral(e.context)} },`,
    )
    .join("\n");

  const footer = "\n];\n";
  writeFileSync(OUTPUT_DATASET_TS_FILE, header + body + footer, "utf8");
}

function writeOverridesTs(orderedEntries) {
  const header =
    "import \"server-only\";\n\n" +
    'import type { MostCommonEnglishWordEntry } from "./mostCommonEnglishWords2000.types";\n\n' +
    "export const MOST_COMMON_ENGLISH_WORDS_2000_FULL_OVERRIDES: Record<string, MostCommonEnglishWordEntry> = {\n";

  const body = orderedEntries
    .map((e) =>
      `  ${toTsStringLiteral(e.word.toLowerCase())}: { word: ${toTsStringLiteral(
        e.word,
      )}, translationPtBr: ${toTsStringLiteral(e.translationPtBr)}, exampleEn: ${toTsStringLiteral(
        e.exampleEn,
      )}, examplePtBr: ${toTsStringLiteral(e.examplePtBr)}, context: ${toTsStringLiteral(
        e.context,
      )} },`,
    )
    .join("\n");

  const footer = "\n};\n";
  writeFileSync(OUTPUT_OVERRIDES_TS_FILE, header + body + footer, "utf8");
}

async function main() {
  const words = loadWords2000();
  const cache = loadCache();

  let completed = 0;

  const tasks = words.map((word) => ({ word }));

  const entries = await runPool(
    tasks,
    async ({ word }) => {
      const key = word.toLowerCase();

      if (cache[key] && cache[key].translationPtBr && cache[key].examplePtBr) {
        completed += 1;
        if (completed % 50 === 0) {
          console.log(`Progress: ${completed}/${words.length} (cached)`);
        }
        return cache[key];
      }

      const exampleEn = buildExampleEn(word);
      const context = buildContext(word);

      // 1) tradução da palavra
      let translationPtBr = special[key]?.translationPtBr;
      if (!translationPtBr) {
        translationPtBr = await translateWithRetry(word);
        await sleep(DELAY_MS);
      }

      // 2) tradução da frase
      let examplePtBr = special[key]?.examplePtBr;
      if (!examplePtBr) {
        try {
          examplePtBr = await translateWithRetry(exampleEn);
          await sleep(DELAY_MS);
        } catch {
          // fallback local (sem chamada remota)
          examplePtBr = buildExamplePtBr(word);
        }
      }

      const entry = {
        word,
        translationPtBr: translationPtBr || word,
        exampleEn,
        examplePtBr: examplePtBr || "",
        context,
      };

      cache[key] = entry;
      completed += 1;
      if (completed % 25 === 0) {
        console.log(`Progress: ${completed}/${words.length}`);
        saveCache(cache);
      }

      return entry;
    },
    CONCURRENCY,
  );

  saveCache(cache);

  // Mantém a ordem original das palavras.
  const byWord = new Map(entries.map((e) => [e.word.toLowerCase(), e]));
  const ordered = words.map((w) => byWord.get(w.toLowerCase()));

  if (ordered.some((e) => !e)) {
    throw new Error("Missing entries after generation");
  }

  writeDatasetTs(ordered);
  writeOverridesTs(ordered);
  console.log(`Wrote ${OUTPUT_DATASET_TS_FILE}`);
  console.log(`Wrote ${OUTPUT_OVERRIDES_TS_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
