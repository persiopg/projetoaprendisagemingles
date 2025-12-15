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
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPhrase = phrases[currentIndex];

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

  const nextCard = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentPhrase) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          Nenhuma frase disponível para este nível.
        </p>
      </div>
    );
  }

  const isCurrentLearned = learned.has(currentPhrase.word);
  const isCurrentLoading = loading === currentPhrase.word;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Main Card Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className={`flex-1 p-8 rounded-2xl shadow-lg border flex flex-col justify-center items-center text-center transition-all relative ${
          isCurrentLearned 
            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
        }`}>
          
          <div className="absolute top-6 left-6">
             <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ring-1 ring-inset ${
                isCurrentLearned
                  ? 'bg-green-100 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20'
                  : 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30'
              }`}>
                {currentPhrase.word}
              </span>
          </div>

          <div className="absolute top-6 right-6 flex gap-2">
             {isLoggedIn && (
                <button
                  onClick={() => toggleLearned(currentPhrase.word)}
                  disabled={isCurrentLoading}
                  className={`p-3 rounded-full transition-colors ${
                    isCurrentLearned
                      ? 'text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                      : 'text-zinc-400 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
                  }`}
                  title={isCurrentLearned ? "Marcar como não aprendido" : "Marcar como aprendido"}
                >
                  {isCurrentLoading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )}
          </div>

          <div className="max-w-2xl w-full space-y-8">
            <p className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
              {currentPhrase.exampleEn}
            </p>
            
            <div className={`pt-6 border-t ${isCurrentLearned ? 'border-green-200 dark:border-green-800' : 'border-zinc-100 dark:border-zinc-800'}`}>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 italic">
                {currentPhrase.examplePtBr}
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={() => currentPhrase.exampleEn && speak(currentPhrase.exampleEn)}
                className={`p-6 rounded-full transition-all transform hover:scale-105 ${
                  speaking === currentPhrase.exampleEn 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-4 ring-blue-200 dark:ring-blue-900/50' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                }`}
                disabled={!currentPhrase.exampleEn}
                aria-label="Ouvir frase"
                title="Ouvir frase"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-4 px-4 flex-none">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Anterior
          </button>
          
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {currentIndex + 1} de {phrases.length}
          </span>

          <button
            onClick={nextCard}
            disabled={currentIndex === phrases.length - 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Próxima
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar List */}
      <div className="w-full lg:w-80 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm h-full">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex-none">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Lista do Nível</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {learned.size} aprendidas neste nível
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {phrases.map((phrase, index) => {
            const isLearned = learned.has(phrase.word);
            const isActive = index === currentIndex;
            
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'hover:bg-zinc-100 text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                <span className="font-medium truncate flex-1 mr-2">{phrase.word}</span>
                {isLearned && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
