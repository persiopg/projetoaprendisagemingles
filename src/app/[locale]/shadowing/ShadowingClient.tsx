"use client";

import { useState } from "react";
import type { MostCommonEnglishWordEntry } from "@/data/mostCommonEnglishWords2000.types";

interface ShadowingClientProps {
  phrases: MostCommonEnglishWordEntry[];
}

export function ShadowingClient({ phrases }: ShadowingClientProps) {
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  const visiblePhrases = phrases.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 24, phrases.length));
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for shadowing
      
      utterance.onstart = () => setSpeaking(text);
      utterance.onend = () => setSpeaking(null);
      utterance.onerror = () => setSpeaking(null);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visiblePhrases.map((phrase, index) => (
          <div key={index} className="p-6 bg-white rounded-lg shadow dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                {phrase.word}
              </span>
              <button
                onClick={() => phrase.exampleEn && speak(phrase.exampleEn)}
                className={`p-2 rounded-full transition-colors ${
                  speaking === phrase.exampleEn 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'hover:bg-zinc-100 text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-400'
                }`}
                disabled={!phrase.exampleEn}
                aria-label="Ouvir frase"
                title="Ouvir frase"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              </button>
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  {phrase.exampleEn}
                </p>
              </div>
              
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                  {phrase.examplePtBr}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < phrases.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors font-medium"
          >
            Carregar mais frases
          </button>
        </div>
      )}
    </div>
  );
}
