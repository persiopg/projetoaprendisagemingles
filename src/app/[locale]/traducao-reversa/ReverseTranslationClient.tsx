"use client";

import { ReverseTranslationGame } from "@/components/ReverseTranslationGame";
import { useRouter } from "next/navigation";

interface ReverseTranslationClientProps {
  sentences: { text: string; translation: string | null }[];
  locale: string;
}

export function ReverseTranslationClient({ sentences, locale }: ReverseTranslationClientProps) {
  const router = useRouter();

  const handleComplete = async (score: number, total: number) => {
    try {
      await fetch("/api/reverse-translation/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score, totalQuestions: total }),
      });
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  };

  return (
    <ReverseTranslationGame sentences={sentences} onComplete={handleComplete} />
  );
}
