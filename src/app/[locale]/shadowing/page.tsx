import { getMostCommonEnglishWords2000 } from "@/data/mostCommonEnglishWords2000";
import { ShadowingClient } from "./ShadowingClient";
import { getDictionary } from "@/i18n/getDictionary";
import { defaultLocale, isLocale } from "@/i18n/locales";

export default async function ShadowingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  
  const allWords = await getMostCommonEnglishWords2000();
  // Filter words that have examples
  const phrases = allWords.filter(w => w.exampleEn && w.examplePtBr);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
          {dictionary.navShadowing}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
          A técnica de Shadowing consiste em ouvir e repetir o áudio quase simultaneamente. 
          Use as frases abaixo para praticar sua pronúncia, entonação e ritmo.
        </p>
      </div>
      
      <ShadowingClient phrases={phrases} />
    </div>
  );
}
