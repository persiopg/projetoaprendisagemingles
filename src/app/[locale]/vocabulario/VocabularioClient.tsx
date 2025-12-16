"use client";

import { useEffect, useMemo, useState } from "react";

type Source = "shadowing" | "dictation" | "reverse_translation" | "review";

type VocabMistakeItem = {
  source: Source;
  wordEn: string;
  wordPtBr: string;
  wrongCount: number;
  lastWrongAt: string | null;
};

function normalizeAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceLabel(locale: string, source: Source): string {
  if (locale === "pt-br") {
    if (source === "review") return "Revisão";
    if (source === "dictation") return "Ditado";
    if (source === "shadowing") return "Shadowing";
    return "Tradução reversa";
  }
  if (locale === "es") {
    if (source === "review") return "Revisión";
    if (source === "dictation") return "Dictado";
    if (source === "shadowing") return "Shadowing";
    return "Traducción inversa";
  }
  if (source === "review") return "Review";
  if (source === "dictation") return "Dictation";
  if (source === "shadowing") return "Shadowing";
  return "Reverse translation";
}

export function VocabularioClient({ locale }: { locale: string }) {
  const [items, setItems] = useState<VocabMistakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<null | { ok: boolean; expected: string }>(null);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/vocab-mistakes?limit=200");
        if (!res.ok) {
          throw new Error("request_failed");
        }
        const data = (await res.json()) as { items: VocabMistakeItem[] };
        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items : []);
          setCurrentIndex(0);
          setUserInput("");
          setFeedback(null);
          setLearnedWords([]);
        }
      } catch {
        if (!cancelled) {
          setError(
            locale === "pt-br"
              ? "Não foi possível carregar seu vocabulário."
              : locale === "es"
                ? "No se pudo cargar tu vocabulario."
                : "Could not load your vocabulary."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const current = items[currentIndex] ?? null;

  const mode = useMemo(() => {
    if (!current) return null;
    const isPtToEn = current.source === "reverse_translation";
    return {
      isPtToEn,
      prompt: isPtToEn ? current.wordPtBr : current.wordEn,
      expected: isPtToEn ? current.wordEn : current.wordPtBr,
    };
  }, [current]);

  const resolveAsLearned = async (item: VocabMistakeItem) => {
    // 1) marca como aprendida (usa flashcards_progress)
    try {
      await fetch("/api/flashcards/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: item.wordEn, isLearned: true }),
      });
    } catch {
      // ignore
    }

    // 2) remove da lista de erros (vocab_mistakes)
    try {
      await fetch("/api/vocab-mistakes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: item.source, wordEn: item.wordEn }),
      });
    } catch {
      // ignore
    }

    // 3) atualiza UI local
    setLearnedWords((prev) => (prev.includes(item.wordEn) ? prev : [item.wordEn, ...prev]));

    setItems((prev) => {
      const next = prev.filter((p) => !(p.source === item.source && p.wordEn === item.wordEn));
      setCurrentIndex((prevIdx) => {
        if (next.length <= 0) return 0;
        return Math.min(prevIdx, next.length - 1);
      });
      return next;
    });

    setUserInput("");
    setFeedback(null);
  };

  const onCheck = async () => {
    if (!mode) return;
    if (!current) return;
    const ok = normalizeAnswer(userInput) === normalizeAnswer(mode.expected);
    setFeedback({ ok, expected: mode.expected });

    if (ok) {
      await resolveAsLearned(current);
    }
  };

  const onNext = () => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setUserInput("");
    setFeedback(null);
  };

  if (loading) {
    return (
      <div className="text-center text-zinc-500">
        {locale === "pt-br" ? "Carregando..." : locale === "es" ? "Cargando..." : "Loading..."}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  if (!current || !mode) {
    return (
      <div className="text-center text-zinc-500">
        {locale === "pt-br"
          ? "Você ainda não tem palavras registradas como erro."
          : locale === "es"
            ? "Todavía no tienes palabras registradas como error."
            : "You don't have any recorded wrong words yet."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-zinc-500 uppercase">
              {locale === "pt-br" ? "Modo" : locale === "es" ? "Modo" : "Mode"}
            </div>
            <div className="text-zinc-900 dark:text-zinc-100 font-medium">
              {mode.isPtToEn ? "PT → EN" : "EN → PT"}
              <span className="text-zinc-500 dark:text-zinc-400 font-normal"> · {sourceLabel(locale, current.source)}</span>
            </div>
          </div>
          <div className="text-sm text-zinc-500">
            {currentIndex + 1} / {items.length}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold text-zinc-500 uppercase">
            {locale === "pt-br"
              ? mode.isPtToEn
                ? "Traduza para inglês"
                : "Traduza para português"
              : locale === "es"
                ? mode.isPtToEn
                  ? "Traduce al inglés"
                  : "Traduce al portugués"
                : mode.isPtToEn
                  ? "Translate to English"
                  : "Translate to Portuguese"}
          </div>
          <div className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
            {mode.prompt}
          </div>
        </div>

        <div className="mt-6">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={
              locale === "pt-br"
                ? "Digite sua resposta..."
                : locale === "es"
                  ? "Escribe tu respuesta..."
                  : "Type your answer..."
            }
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCheck();
              }
            }}
          />

          <div className="mt-3 flex gap-3">
            <button
              onClick={onCheck}
              disabled={!userInput.trim()}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locale === "pt-br" ? "Conferir" : locale === "es" ? "Comprobar" : "Check"}
            </button>
            <button
              onClick={onNext}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {locale === "pt-br" ? "Próxima" : locale === "es" ? "Siguiente" : "Next"}
            </button>
          </div>

          {feedback && (
            <div
              className={`mt-4 p-4 rounded-lg border ${
                feedback.ok
                  ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/50"
                  : "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50"
              }`}
            >
              {feedback.ok ? (
                <div>{locale === "pt-br" ? "Certo!" : locale === "es" ? "¡Correcto!" : "Correct!"}</div>
              ) : (
                <div>
                  {locale === "pt-br" ? "Errado." : locale === "es" ? "Incorrecto." : "Wrong."} {" "}
                  <span className="font-semibold">
                    {locale === "pt-br"
                      ? `Resposta: ${feedback.expected}`
                      : locale === "es"
                        ? `Respuesta: ${feedback.expected}`
                        : `Answer: ${feedback.expected}`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {learnedWords.length > 0 ? (
        <aside className="p-5 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {locale === "pt-br" ? "Palavras aprendidas" : locale === "es" ? "Palabras aprendidas" : "Learned words"}
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {locale === "pt-br"
              ? "Quando você acerta, a palavra sai dos erros e entra aqui."
              : locale === "es"
                ? "Cuando aciertas, la palabra sale de errores y entra aquí."
                : "When you get it right, the word leaves mistakes and appears here."}
          </p>

          <ol className="mt-4 space-y-3 text-sm">
            {learnedWords.map((w) => (
              <li
                key={w}
                className="w-full text-left p-3 rounded-lg border bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-800"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{w}</div>
              </li>
            ))}
          </ol>
        </aside>
      ) : (
        <aside className="p-5 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {locale === "pt-br" ? "Palavras aprendidas" : locale === "es" ? "Palabras aprendidas" : "Learned words"}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {locale === "pt-br"
              ? "Quando você acertar uma palavra aqui, ela vai aparecer nesta lista."
              : locale === "es"
                ? "Cuando aciertes una palabra aquí, aparecerá en esta lista."
                : "When you get a word right here, it will appear in this list."}
          </p>
        </aside>
      )}
    </div>
  );
}
