import { getMostCommonEnglishWords2000 } from "@/data/mostCommonEnglishWords2000";
import { ShadowingClient } from "./ShadowingClient";
import { getDictionary } from "@/i18n/getDictionary";
import { defaultLocale, isLocale } from "@/i18n/locales";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export default async function ShadowingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const session = await getServerSession(authOptions);
  
  const allWords = await getMostCommonEnglishWords2000();
  // Filter words that have examples
  const validPhrases = allWords.filter(w => w.exampleEn && w.examplePtBr);

  let learnedWords = new Set<string>();
  let phrasesToShow = validPhrases;

  if (session?.user?.email) {
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
      
      progress.forEach((p) => learnedWords.add(p.word));
    }

    // Filter out learned words to show only new ones (or maybe show a mix?)
    // For "Daily Goal" style, let's show the first 20 unlearned words.
    // const unlearnedPhrases = validPhrases.filter(p => !learnedWords.has(p.word));
    // phrasesToShow = unlearnedPhrases.slice(0, 20);

    // Use Level Logic (2000/7)
    const batchSize = Math.ceil(2000 / 7); // ~286 words per level
    const currentLevel = Math.floor(learnedWords.size / batchSize);
    
    const start = currentLevel * batchSize;
    const end = start + batchSize;
    
    // Get the current batch of words (mixed learned and unlearned)
    phrasesToShow = validPhrases.slice(start, end);

  } else {
    // If not logged in, show first batch
    const batchSize = Math.ceil(2000 / 7);
    phrasesToShow = validPhrases.slice(0, batchSize);
  }

  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4 flex-none">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
          {dictionary.navShadowing}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mb-2">
          A técnica de Shadowing consiste em ouvir e repetir o áudio quase simultaneamente. 
        </p>
        
        {session ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800 inline-block">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Você já aprendeu <strong>{learnedWords.size}</strong> frases! 
              Hoje temos <strong>{phrasesToShow.length}</strong> novas frases para você praticar.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-100 dark:border-yellow-800 inline-block">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Faça login para salvar seu progresso e acompanhar quantas frases você já aprendeu.
            </p>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-h-0">
        <ShadowingClient 
          phrases={phrasesToShow} 
          initialLearnedWords={Array.from(learnedWords)}
          isLoggedIn={!!session}
        />
      </div>
    </div>
  );
}
