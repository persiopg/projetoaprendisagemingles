import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMostCommonEnglishWords2000 } from "@/data/mostCommonEnglishWords2000";
import FlashcardGame from "@/components/FlashcardGame";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export default async function MyFlashcardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { locale } = await params;

  if (!session || !session.user?.email) {
    redirect(`/${locale}/login`);
  }

  const words = await getMostCommonEnglishWords2000();
  
  // Fetch user progress
  const [users] = await db.execute<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [session.user.email]
  );

  let learnedWords = new Set<string>();

  if (users.length > 0) {
    const userId = users[0].id;
    const [progress] = await db.execute<RowDataPacket[]>(
      "SELECT word FROM flashcard_progress WHERE user_id = ? AND is_learned = 1",
      [userId]
    );
    
    progress.forEach((p) => learnedWords.add(p.word));
  }

  // Filter words to show only unlearned ones, limited to ~286 (2000/7)
  const validWords = words.filter((w) => w.translationPtBr);
  const unlearnedWords = validWords.filter((w) => !learnedWords.has(w.word));
  const dailyLimit = Math.ceil(2000 / 7);
  const dailyBatch = unlearnedWords.slice(0, dailyLimit);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Meus Flashcards</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bem-vindo, {session.user?.name}! Aqui você pode praticar suas palavras.
        </p>
      </div>

      <FlashcardGame 
        initialWords={dailyBatch} 
        initialLearnedWords={[]} // Start with 0 learned in this batch
        totalLearnedCount={learnedWords.size}
        totalWordCount={validWords.length}
      />
    </div>
  );
}
