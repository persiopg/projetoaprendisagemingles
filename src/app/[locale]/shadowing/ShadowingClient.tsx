"use client";

import { useState } from "react";
import type { MostCommonEnglishWordEntry } from "@/data/mostCommonEnglishWords2000.types";

interface ShadowingClientProps {
  phrases: MostCommonEnglishWordEntry[];
  initialLearnedWords?: string[];
  isLoggedIn: boolean;
}

export function ShadowingClient({ phrases, initialLearnedWords = [], isLoggedIn }: ShadowingClientProps) {
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [learned, setLearned] = useState<Set<string>>(new Set(initialLearnedWords));
  const [loading, setLoading] = useState<string | null>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeaking(text);
      utterance.onend = () => setSpeaking(null);
      utterance.onerror = () => setSpeaking(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleLearned = async (word: string) => {
    if (!isLoggedIn) return;
    
    const isCurrentlyLearned = learned.has(word);
    const newLearnedState = !isCurrentlyLearned;
    
    setLoading(word);
    
    try {
      const response = await fetch('/api/shadowing/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, isLearned: newLearnedState }),
      });

      if (response.ok) {
        setLearned(prev => {
          const next = new Set(prev);
          if (newLearnedState) {
            next.add(word);
          } else {
            next.delete(word);
          }
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to update progress', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {phrases.map((phrase, index) => {
          const isLearned = learned.has(phrase.word);
          const isLoading = loading === phrase.word;

          return (
            <div key={index} className={`p-6 rounded-lg shadow border flex flex-col transition-all ${
              isLearned 
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  isLearned
                    ? 'bg-green-100 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20'
                    : 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30'
                }`}>
                  {phrase.word}
                </span>
                <div className="flex gap-2">
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
                  
                  {isLoggedIn && (
                    <button
                      onClick={() => toggleLearned(phrase.word)}
                      disabled={isLoading}
                      className={`p-2 rounded-full transition-colors ${
                        isLearned
                          ? 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'
                          : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
                      }`}
                      title={isLearned ? "Marcar como não aprendido" : "Marcar como aprendido"}
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                    {phrase.exampleEn}
                  </p>
                </div>
                
                <div className={`pt-3 border-t ${isLearned ? 'border-green-200 dark:border-green-800' : 'border-zinc-100 dark:border-zinc-800'}`}>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                    {phrase.examplePtBr}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {phrases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            Parabéns! Você completou todas as frases disponíveis por hoje.
          </p>
        </div>
      )}
    </div>
  );
}
