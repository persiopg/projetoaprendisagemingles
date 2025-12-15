import { getMostCommonEnglishWords2000 } from "@/data/mostCommonEnglishWords2000";
import FlashcardGame from "@/components/FlashcardGame";
import Link from "next/link";

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const words = await getMostCommonEnglishWords2000();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
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

      <FlashcardGame initialWords={words} />
    </div>
  );
}
