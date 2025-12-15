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

  // Calculate batch based on total learned count to allow review/unlearning
  const validWords = words.filter((w) => w.translationPtBr);
  const batchSize = Math.ceil(2000 / 7); // ~286 words per level
  const currentLevel = Math.floor(learnedWords.size / batchSize);
  
  const start = currentLevel * batchSize;
  const end = start + batchSize;
  
  // Get the current batch of words (mixed learned and unlearned)
  const dailyBatch = validWords.slice(start, end);
  
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
        initialLearnedWords={Array.from(learnedWords)}
        totalLearnedCount={learnedWords.size}
        totalWordCount={validWords.length}
      />
    </div>
  );
}
