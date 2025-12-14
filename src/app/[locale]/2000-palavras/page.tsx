import { notFound } from "next/navigation";

import { getMostCommonEnglishWords2000 } from "@/data/mostCommonEnglishWords2000";
import { isLocale, locales, type Locale } from "@/i18n/locales";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function getCopy(locale: Locale) {
  if (locale === "pt-br") {
    return {
      title: "2000 palavras mais usadas no inglês",
      subtitle:
        "Formato: palavra (inglês), tradução (pt-br), frase, tradução da frase e contexto.",
      headers: {
        word: "Palavra (EN)",
        translation: "Tradução (PT-BR)",
        exampleEn: "Frase (EN)",
        examplePtBr: "Tradução da frase (PT-BR)",
        context: "Contexto",
      },
      missing: "—",
    };
  }

  if (locale === "es") {
    return {
      title: "2000 palabras más usadas en inglés",
      subtitle:
        "Formato: palabra (inglés), traducción (pt-br), frase, traducción de la frase y contexto.",
      headers: {
        word: "Palabra (EN)",
        translation: "Traducción (PT-BR)",
        exampleEn: "Frase (EN)",
        examplePtBr: "Traducción de la frase (PT-BR)",
        context: "Contexto",
      },
      missing: "—",
    };
  }

  return {
    title: "2000 most common English words",
    subtitle:
      "Format: word (English), translation (pt-br), example sentence, sentence translation, and context.",
    headers: {
      word: "Word (EN)",
      translation: "Translation (PT-BR)",
      exampleEn: "Example (EN)",
      examplePtBr: "Sentence translation (PT-BR)",
      context: "Context",
    },
    missing: "—",
  };
}

export default async function MostCommonWordsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getCopy(locale);
  const entries = await getMostCommonEnglishWords2000();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {copy.title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">{copy.subtitle}</p>
        </header>

        <main className="mt-8">
          <div className="rounded-2xl border border-solid border-black/8 bg-white p-4 dark:border-white/[.145] dark:bg-black sm:p-6">
            <div className="grid grid-cols-1 gap-2 border-b border-solid border-black/8 pb-4 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:border-white/[.145] dark:text-zinc-400 sm:grid-cols-12 sm:gap-3">
              <div className="sm:col-span-2">{copy.headers.word}</div>
              <div className="sm:col-span-2">{copy.headers.translation}</div>
              <div className="sm:col-span-3">{copy.headers.exampleEn}</div>
              <div className="sm:col-span-3">{copy.headers.examplePtBr}</div>
              <div className="sm:col-span-2">{copy.headers.context}</div>
            </div>

            <ul className="divide-y divide-black/8 dark:divide-white/[.145]">
              {entries.map((entry) => (
                <li
                  key={entry.word}
                  className="grid grid-cols-1 gap-2 py-4 text-sm text-zinc-950 dark:text-zinc-50 sm:grid-cols-12 sm:gap-3"
                >
                  <div className="sm:col-span-2">
                    <span className="font-semibold">{entry.word}</span>
                  </div>
                  <div className="sm:col-span-2 text-zinc-600 dark:text-zinc-400">
                    {entry.translationPtBr ?? copy.missing}
                  </div>
                  <div className="sm:col-span-3 text-zinc-600 dark:text-zinc-400">
                    {entry.exampleEn ?? copy.missing}
                  </div>
                  <div className="sm:col-span-3 text-zinc-600 dark:text-zinc-400">
                    {entry.examplePtBr ?? copy.missing}
                  </div>
                  <div className="sm:col-span-2 text-zinc-600 dark:text-zinc-400">
                    {entry.context ?? copy.missing}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
