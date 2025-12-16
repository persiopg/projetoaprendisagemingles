import { getMostCommonEnglishWords2000 } from "@/data/mostCommonEnglishWords2000";
import { ShadowingClient } from "./ShadowingClient";
import { getDictionary } from "@/i18n/getDictionary";
import { defaultLocale, isLocale } from "@/i18n/locales";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const dynamic = "force-dynamic";

export default async function ShadowingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/shadowing`);
  }
  
  const allWords = await getMostCommonEnglishWords2000();
  // Filter words that have examples
  const validWords = allWords.filter(w => w.exampleEn && w.examplePtBr);

  // Expand words -> frases (uma entrada por sentença)
  type SentenceItem = { id: string; word: string; wordPtBr: string; en: string; pt: string };
  const sentences: SentenceItem[] = [];
  for (const w of validWords) {
    const enArr = w.exampleEn ?? [];
    const ptArr = w.examplePtBr ?? [];
    for (let i = 0; i < enArr.length; i++) {
      const id = `${w.word}::${i}`;
      sentences.push({ id, word: w.word, wordPtBr: w.translationPtBr ?? "", en: enArr[i], pt: ptArr[i] ?? "" });
    }
  }

  const learnedSentences = new Set<string>();

  const [users] = await db.execute<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [session.user.email]
  );

  if (users.length > 0) {
    const userId = users[0].id;
    const [progress] = await db.execute<RowDataPacket[]>(
      "SELECT word FROM shadowing_progress WHERE user_id = ? AND is_learned = 1",
      [userId]
    );

    progress.forEach((p) => {
      const key = p.word as string;
      if (key.includes("::")) {
        // já é uma frase (id)
        learnedSentences.add(key);
      } else {
        // Entradas antigas marcavam a palavra inteira — marca todas as frases daquela palavra como aprendidas
        for (const s of sentences.filter(ss => ss.word === key)) {
          learnedSentences.add(s.id);
        }
      }
    });
  }

  // Use Level Logic based on frases (6000/7 → total frases / 7)
  const totalSentences = sentences.length;
  const batchSize = Math.ceil(totalSentences / 7);
  const currentLevel = Math.floor(learnedSentences.size / batchSize);

  const start = currentLevel * batchSize;
  const end = start + batchSize;

  // Get the current batch of sentences
  const phrasesToShow = sentences.slice(start, end);

  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4 flex-none">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
          {dictionary.navShadowing}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400  mb-2">
          A técnica de Shadowing consiste em ouvir e repetir o áudio quase simultaneamente. 
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800 inline-block">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Você já aprendeu <strong>{learnedSentences.size}</strong> frases! Hoje temos{" "}
            <strong>{phrasesToShow.length}</strong> novas frases para você praticar.
          </p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ShadowingClient 
          phrases={phrasesToShow} 
          initialLearnedWords={Array.from(learnedSentences)}
          isLoggedIn={true}
        />
      </div>
    </div>
  );
}
