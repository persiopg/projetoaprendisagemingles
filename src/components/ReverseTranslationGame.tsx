"use client";

import { useState, useRef, useEffect } from "react";
import * as Diff from "diff";

interface ReverseTranslationGameProps {
  sentences: { text: string; translation: string | null }[];
  onComplete: (score: number, total: number) => void;
}

export function ReverseTranslationGame({ sentences, onComplete }: ReverseTranslationGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [diffResult, setDiffResult] = useState<Diff.Change[]>([]);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentSentence = sentences[currentIndex];

  useEffect(() => {
    if (inputRef.current && !showResult && !gameFinished) {
      inputRef.current.focus();
    }
  }, [currentIndex, showResult, gameFinished]);

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      // Expand contractions
      .replace(/n't/g, " not")
      .replace(/'re/g, " are")
      .replace(/'s/g, " is")
      .replace(/'d/g, " would")
      .replace(/'ll/g, " will")
      .replace(/'ve/g, " have")
      .replace(/'m/g, " am")
      // Remove punctuation
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const checkAnswer = () => {
    const normalizedOriginal = normalizeText(currentSentence.text);
    const normalizedInput = normalizeText(userInput);

    const diff = Diff.diffWords(normalizedOriginal, normalizedInput);
    setDiffResult(diff);
    
    const isCorrect = normalizedOriginal === normalizedInput;
    
    if (isCorrect) {
        setScore(prev => prev + 1);
    }

    setShowResult(true);
  };

  const isCurrentCorrect = () => {
      const normalizedOriginal = normalizeText(currentSentence.text);
      const normalizedInput = normalizeText(userInput);
      return normalizedOriginal === normalizedInput;
  };

  const nextSentence = () => {
    if (currentIndex < sentences.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setUserInput("");
        setShowResult(false);
        setDiffResult([]);
    } else {
        setGameFinished(true);
        onComplete(score + (showResult && isCurrentCorrect() ? 0 : 0), sentences.length); 
    }
  };

  if (gameFinished) {
      return (
          <div className=" mx-auto p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 text-center">
              <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Game Over!</h2>
              <div className="text-6xl font-bold text-blue-600 mb-6">
                  {score} / {sentences.length}
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                  {score === sentences.length ? "Perfect score! 🎉" : "Keep practicing! 💪"}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                  Play Again
              </button>
          </div>
      );
  }

  if (!currentSentence) return <div>No sentences available.</div>;

  return (
    <div className=" mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Reverse Translation</h2>
        <span className="text-sm font-medium px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400">
            {currentIndex + 1} / {sentences.length}
        </span>
      </div>
      
      <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2 uppercase tracking-wider">Translate to English</p>
        <p className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">
            {currentSentence.translation || "Translation missing"}
        </p>
      </div>

      <div className="mb-6">
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type the English translation..."
          className="w-full p-4 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-lg"
          rows={4}
          disabled={showResult}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !showResult) {
              e.preventDefault();
              checkAnswer();
            }
          }}
        />
      </div>

      {!showResult ? (
        <button
          onClick={checkAnswer}
          disabled={!userInput.trim()}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Answer
        </button>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold mb-3 text-zinc-700 dark:text-zinc-300">Comparison:</h3>
            <div className="text-lg leading-relaxed font-mono">
              {diffResult.map((part, index) => {
                if (part.removed) {
                    return <span key={index} className="text-green-600 bg-green-100 dark:bg-green-900/30 px-1 rounded mx-0.5">{part.value}</span>;
                }
                if (part.added) {
                    return <span key={index} className="text-red-600 bg-red-100 dark:bg-red-900/30 line-through px-1 rounded mx-0.5">{part.value}</span>;
                }
                return <span key={index} className="text-zinc-900 dark:text-zinc-100">{part.value}</span>;
              })}
            </div>
            <div className="mt-4 text-sm text-zinc-500 flex gap-4">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 border border-green-600 rounded"></span> Missing/Correct</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 border border-red-600 rounded"></span> Extra/Wrong</span>
            </div>
          </div>
          
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
             <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Correct English Sentence:</div>
             <div className="text-lg text-zinc-900 dark:text-zinc-100">{currentSentence.text}</div>
          </div>

          <button
            onClick={nextSentence}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            {currentIndex < sentences.length - 1 ? "Next Sentence" : "Finish Game"}
          </button>
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-zinc-500">
        Score: {score}
      </div>
    </div>
  );
}
