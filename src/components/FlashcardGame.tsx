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
  
  // Calculate current total progress. 
  // Note: totalLearnedCount comes from DB. learnedWords.size includes words learned in this session AND previous sessions (if passed in initialLearnedWords).
  // We need to be careful not to double count if initialLearnedWords are included in totalLearnedCount.
  // The simplest way is to trust the parent to pass the correct total, and we just display learnedWords.size for the session?
  // Actually, let's just use learnedWords.size for the current batch status.
  // For the global total, we can use totalLearnedCount (which is static from server load) + (learnedWords.size - initialLearnedWords.length).
  
  const sessionLearnedCount = useMemo(() => {
    const initialSet = new Set(initialLearnedWords);
    let newLearned = 0;
    learnedWords.forEach(w => {
      if (!initialSet.has(w)) newLearned++;
    });
    return newLearned;
  }, [learnedWords, initialLearnedWords]);

  // If we unlearn a word that was initially learned, we should decrease the total.
  const sessionUnlearnedCount = useMemo(() => {
    const currentSet = learnedWords;
    let unlearned = 0;
    initialLearnedWords.forEach(w => {
      if (!currentSet.has(w)) unlearned++;
    });
    return unlearned;
  }, [learnedWords, initialLearnedWords]);

  const currentTotalLearned = totalLearnedCount + sessionLearnedCount - sessionUnlearnedCount;
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
    <div className="flex flex-col lg:flex-row items-start justify-center min-h-[80vh] p-4 gap-6 w-full max-w-[95vw] mx-auto">
      {/* Left Column: Game Area */}
      <div className="flex flex-col items-center w-full lg:flex-1">
        <div className="w-full max-w-3xl mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
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

        <div className="w-full max-w-3xl flex justify-between items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span>Palavra {currentIndex + 1} de {words.length}</span>
          <span>Nesta Sessão: {learnedWords.size}</span>
        </div>

        <div
          className="relative w-full max-w-3xl h-[500px] cursor-pointer perspective-[1000px]"
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
              <h2 className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
                {currentWord.word}
              </h2>
              <p className="text-base text-gray-400 mt-4">Clique para ver a tradução</p>
            </div>

            {/* Back */}
            <div
              className="absolute w-full h-full bg-blue-50 dark:bg-gray-900 rounded-xl shadow-xl flex flex-col items-center justify-center p-8 border-2 border-blue-200 dark:border-blue-800 backface-hidden transform-[rotateY(180deg)]"
            >
              <h3 className="text-4xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">
                {currentWord.translationPtBr}
              </h3>
              
              {currentWord.context && (
                <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full mb-6">
                  {currentWord.context}
                </span>
              )}

              {currentWord.exampleEn && (
                <div className="text-center mt-6 space-y-3 max-w-2xl">
                  <p className="text-xl text-gray-700 dark:text-gray-300 italic">
                    &quot;{currentWord.exampleEn}&quot;
                  </p>
                  {currentWord.examplePtBr && (
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      &quot;{currentWord.examplePtBr}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-8 w-full max-w-3xl">
          <div className="flex justify-between gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="flex-1 px-6 py-3 text-lg bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="flex-1 px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Próximo
            </button>
          </div>

          <button
            onClick={toggleLearned}
            className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-colors flex items-center justify-center gap-2 ${
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

      {/* Right Column: Learned Words List */}
      <div className="w-full lg:w-96 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-4 h-[600px] lg:h-[calc(100vh-150px)] flex flex-col sticky top-4">
        <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <span>✓</span> Palavras Aprendidas
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
            {learnedWords.size}
          </span>
        </h3>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {words.filter(w => learnedWords.has(w.word)).length === 0 ? (
            <p className="text-sm text-gray-500 text-center mt-10">
              Nenhuma palavra aprendida neste nível ainda.
            </p>
          ) : (
            words
              .filter(w => learnedWords.has(w.word))
              .map((w) => (
                <div 
                  key={w.word}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{w.word}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">{w.translationPtBr}</span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
