"use client";

import { DictationGame } from "@/components/DictationGame";
import { useRouter } from "next/navigation";

interface DictationClientProps {
  sentences: { text: string; translation: string | null }[];
  locale: string;
}

export function DictationClient({ sentences, locale }: DictationClientProps) {
  const router = useRouter();

  const handleComplete = async (score: number, total: number) => {
    try {
      await fetch("/api/dictation/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score, totalQuestions: total }),
      });
      
      // Optional: Refresh or redirect
      // router.refresh();
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  };

  return (
    <DictationGame sentences={sentences} onComplete={handleComplete} />
  );
}
