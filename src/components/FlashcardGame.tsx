"use client";

import { useState, useMemo } from "react";
import { MostCommonEnglishWordEntry } from "@/data/mostCommonEnglishWords2000.types";

interface FlashcardGameProps {
  initialWords: MostCommonEnglishWordEntry[];
  initialLearnedWords?: string[];
  totalLearnedCount: number;
  totalWordCount: number;
}

export default function FlashcardGame({ 
  initialWords, 
  initialLearnedWords = [], 
  totalLearnedCount, 
  totalWordCount 
}: FlashcardGameProps) {
  // Filter words to ensure we only show ones with translations
  const words = useMemo(() => {
    return initialWords.filter((w) => w.translationPtBr);
  }, [initialWords]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set(initialLearnedWords));
  
  // Calculate current total progress including session changes
  const currentTotalLearned = totalLearnedCount + learnedWords.size;
  const progressPercentage = Math.min(100, (currentTotalLearned / totalWordCount) * 100);

  const [slideState, setSlideState] = useState<
    "idle" | "exiting-left" | "exiting-right" | "entering-left" | "entering-right"
  >("idle");

  const currentWord = words[currentIndex];
  const isLearned = currentWord ? learnedWords.has(currentWord.word) : false;

  const toggleLearned = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;

    const newIsLearned = !isLearned;
    
    // Optimistic update
    const newLearnedWords = new Set(learnedWords);
    if (newIsLearned) {
      newLearnedWords.add(currentWord.word);
    } else {
      newLearnedWords.delete(currentWord.word);
    }
    setLearnedWords(newLearnedWords);

    try {
      await fetch("/api/flashcards/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: currentWord.word,
          isLearned: newIsLearned,
        }),
      });
    } catch (error) {
      console.error("Failed to update progress", error);
      // Revert on error
      setLearnedWords(learnedWords);
    }
  };

  if (words.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>Carregando ou nenhuma palavra com tradução disponível...</p>
      </div>
    );
  }

  const changeCard = (direction: "next" | "prev") => {
    const isNext = direction === "next";
    const exitState = isNext ? "exiting-left" : "exiting-right";
    const enterState = isNext ? "entering-right" : "entering-left";

    setSlideState(exitState);

    setTimeout(() => {
      if (isNext) {
        setCurrentIndex((prev) => (prev + 1) % words.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
      }

      setSlideState(enterState);

      // Small delay to allow DOM to update with new position before sliding in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlideState("idle");
        });
      });
    }, 300);
  };

  const handleNext = () => {
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        changeCard("next");
      }, 300);
    } else {
      changeCard("next");
    }
  };

  const handlePrev = () => {
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        changeCard("prev");
      }, 300);
    } else {
      changeCard("prev");
    }
  };

  const handleFlip = () => {
    if (slideState === "idle") {
      setIsFlipped(!isFlipped);
    }
  };

  const getSlideStyle = () => {
    const baseTransition = "transform 300ms ease-in-out, opacity 300ms ease-in-out";
    switch (slideState) {
      case "exiting-left":
        return { transform: "translateX(-150%)", opacity: 0, transition: baseTransition };
      case "exiting-right":
        return { transform: "translateX(150%)", opacity: 0, transition: baseTransition };
      case "entering-left":
        return { transform: "translateX(-150%)", opacity: 0, transition: "none" };
      case "entering-right":
        return { transform: "translateX(150%)", opacity: 0, transition: "none" };
      case "idle":
        return { transform: "translateX(0)", opacity: 1, transition: baseTransition };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 overflow-hidden w-full max-w-4xl mx-auto">
      <div className="w-full max-w-md mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <div className="flex justify-between items-end mb-2">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Total Aprendido (Geral)
          </p>
          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
            {currentTotalLearned} / {totalWordCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Meta Diária: {words.length} novas palavras para hoje
        </p>
      </div>

      <div className="w-full flex justify-between items-center mb-4 text-sm text-gray-500 dark:text-gray-400 max-w-md">
        <span>Palavra {currentIndex + 1} de {words.length}</span>
        <span>Nesta Sessão: {learnedWords.size}</span>
      </div>

      <div
        className="relative w-full max-w-md h-80 cursor-pointer perspective-[1000px]"
        style={getSlideStyle()}
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-3d ${
            isFlipped ? "transform-[rotateY(180deg)]" : ""
          }`}
        >
          {/* Front */}
          <div
            className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow-xl flex flex-col items-center justify-center p-8 border-2 border-blue-100 dark:border-blue-900 backface-hidden"
          >
            <h2 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {currentWord.word}
            </h2>
            <p className="text-sm text-gray-400 mt-4">Clique para ver a tradução</p>
          </div>

          {/* Back */}
          <div
            className="absolute w-full h-full bg-blue-50 dark:bg-gray-900 rounded-xl shadow-xl flex flex-col items-center justify-center p-8 border-2 border-blue-200 dark:border-blue-800 backface-hidden transform-[rotateY(180deg)]"
          >
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {currentWord.translationPtBr}
            </h3>
            
            {currentWord.context && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full mb-4">
                {currentWord.context}
              </span>
            )}

            {currentWord.exampleEn && (
              <div className="text-center mt-4 space-y-2">
                <p className="text-lg text-gray-700 dark:text-gray-300 italic">
                  &quot;{currentWord.exampleEn}&quot;
                </p>
                {currentWord.examplePtBr && (
                  <p className="text-md text-gray-500 dark:text-gray-400">
                    &quot;{currentWord.examplePtBr}&quot;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-8 w-full max-w-md">
        <div className="flex justify-between gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Próximo
          </button>
        </div>

        <button
          onClick={toggleLearned}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isLearned
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {isLearned ? (
            <>
              <span>✓</span> Aprendida
            </>
          ) : (
            <>
              <span>○</span> Marcar como aprendida
            </>
          )}
        </button>
      </div>
    </div>
  );
}
