import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/locales";
import { getMostCommonEnglishWords2000 } from "@/data/mostCommonEnglishWords2000";
import { DictationClient } from "./DictationClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DictationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/ditado`);
  }

  const dict = getDictionary(locale as Locale);
  
  const words = await getMostCommonEnglishWords2000();
  
  // Logic for "288 words of the day"
  // We assume a 7-day rotation.
  const dayOfYear = getDayOfYear(new Date());
  const chunkIndex = dayOfYear % 7;
  const chunkSize = 288;
  const start = chunkIndex * chunkSize;
  const end = start + chunkSize;
  
  const dailyWords = words.slice(start, end);
  
  // Expande cada palavra em até 3 frases (EN) + 3 traduções (PT) e escolhe 10 aleatórias
  const sentences = dailyWords
    .flatMap((w) => {
      const en = w.exampleEn ?? [];
      const pt = w.examplePtBr ?? [];
      return en.map((text, idx) => ({
        text,
        translation: pt[idx] ?? null,
        wordEn: w.word,
        wordPtBr: w.translationPtBr,
      }));
    })
    .filter((s) => s.text.length > 10)
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center text-zinc-900 dark:text-zinc-50">
        {dict.navDictation}
      </h1>
      <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8  mx-auto">
        {locale === 'pt-br' 
          ? "Ouça o áudio e digite exatamente o que você ouvir. As frases são baseadas nas palavras do dia."
          : "Listen to the audio and type exactly what you hear. Sentences are based on today's words."
        }
      </p>
      
      {sentences.length > 0 ? (
        <DictationClient sentences={sentences} locale={locale} />
      ) : (
        <div className="text-center text-zinc-500">
          No sentences available for dictation today.
        </div>
      )}
    </div>
  );
}

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

