import { getMostCommonEnglishWords2000 } from "@/data/mostCommonEnglishWords2000";
import FlashcardGame from "@/components/FlashcardGame";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { locale } = await params;

  if (!session || !session.user?.email) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/2000-palavras/flashcards`);
  }

  const words = await getMostCommonEnglishWords2000();

  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4 flex-none">
        <Link 
          href={`/${locale}/2000-palavras`}
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Voltar para a lista
        </Link>
        <h1 className="text-3xl font-bold mb-2">Flashcards: 2000 Palavras Mais Comuns</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pratique sua memorização com estes flashcards. Clique no cartão para ver a resposta.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <FlashcardGame initialWords={words} totalLearnedCount={0} totalWordCount={words.length} />
      </div>
    </div>
  );
}
