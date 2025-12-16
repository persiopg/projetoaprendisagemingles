"use client";

import { ReverseTranslationGame } from "@/components/ReverseTranslationGame";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface ReverseTranslationClientProps {
  sentences: { text: string; translation: string | null; wordEn: string; wordPtBr: string | null }[];
  locale: string;
}

export function ReverseTranslationClient({ sentences, locale }: ReverseTranslationClientProps) {
  const router = useRouter();
  const [answeredIndices, setAnsweredIndices] = useState<number[]>([]);
  const [answersByIndex, setAnswersByIndex] = useState<
    Record<number, { userText: string; isCorrect: boolean }>
  >({});

  const recordMistake = async (index: number) => {
    const s = sentences[index];
    if (!s) return;
    if (!s.wordPtBr) return;

    try {
      await fetch("/api/vocab-mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "reverse_translation",
          wordEn: s.wordEn,
          wordPtBr: s.wordPtBr,
        }),
      });
    } catch {
      // ignore
    }
  };

  const answeredSentences = useMemo(() => {
    return answeredIndices
      .slice()
      .sort((a, b) => a - b)
      .map((idx) => ({ idx, ...sentences[idx] }));
  }, [answeredIndices, sentences]);

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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div>
        <ReverseTranslationGame
          sentences={sentences.map((s) => ({ text: s.text, translation: s.translation }))}
          onComplete={handleComplete}
          onAnswered={({ index, userText, isCorrect }) => {
            setAnsweredIndices((prev) => (prev.includes(index) ? prev : [...prev, index]));
            setAnswersByIndex((prev) => ({
              ...prev,
              [index]: { userText, isCorrect },
            }));

            if (!isCorrect) {
              void recordMistake(index);
            }
          }}
        />
      </div>

      <aside
        aria-label={
          locale === "pt-br"
            ? "Lista das frases respondidas"
            : "List of answered sentences"
        }
        className="p-5 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800"
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {locale === "pt-br" ? "Frases respondidas" : "Answered sentences"}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {locale === "pt-br"
            ? "Aqui aparecem apenas as frases que você já respondeu, com a frase certa, a tradução e sua resposta."
            : "Only sentences you already answered appear here, with correct sentence, translation and your answer."}
        </p>

        {answeredSentences.length === 0 ? (
          <div className="mt-4 text-sm text-zinc-500">
            {locale === "pt-br"
              ? "Nenhuma frase respondida ainda."
              : "No answered sentences yet."}
          </div>
        ) : (
          <ol className="mt-4 space-y-4 text-sm">
            {answeredSentences.map((s) => {
              const answer = answersByIndex[s.idx];
              const isCorrect = answer?.isCorrect ?? false;
              const userText = answer?.userText ?? "";

              return (
                <li key={`${s.idx}-${s.text.slice(0, 16)}`} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {s.idx + 1}.
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full border ${
                        isCorrect
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/50"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50"
                      }`}
                    >
                      {locale === "pt-br"
                        ? isCorrect
                          ? "Acertou"
                          : "Errou"
                        : isCorrect
                          ? "Correct"
                          : "Wrong"}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase">
                      {locale === "pt-br" ? "Tradução (PT)" : "Prompt (PT)"}
                    </div>
                    <div className="text-zinc-900 dark:text-zinc-100">
                      {s.translation ?? "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase">
                      {locale === "pt-br" ? "Frase certa (EN)" : "Correct sentence (EN)"}
                    </div>
                    <div className="text-zinc-900 dark:text-zinc-100">{s.text}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase">
                      {locale === "pt-br" ? "Sua frase" : "Your sentence"}
                    </div>
                    <div
                      className={
                        isCorrect
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-red-700 dark:text-red-300"
                      }
                    >
                      {userText.trim() ? userText : "—"}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </aside>
    </div>
  );
}
