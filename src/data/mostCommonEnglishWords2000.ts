import "server-only";

import type { MostCommonEnglishWordEntry } from "./mostCommonEnglishWords2000.types";
import { WORDS_EN_2000 } from "./mostCommonEnglishWords2000.words";
import { MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES } from "./mostCommonEnglishWords2000.generatedOverrides";

export type { MostCommonEnglishWordEntry };

function toArray(value: string | string[] | null | undefined): string[] {
    if (value == null) return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function normalizeExamplePairs(params: {
    word: string;
    exampleEn: string | string[] | null | undefined;
    examplePtBr: string | string[] | null | undefined;
}): { exampleEn: string[] | null; examplePtBr: string[] | null } {
    const baseEn = toArray(params.exampleEn);
    const basePt = toArray(params.examplePtBr);

    // Se não tem nada, não inventa.
    if (baseEn.length === 0 && basePt.length === 0) {
        return { exampleEn: null, examplePtBr: null };
    }

    const pairs: Array<{ en: string; pt: string }> = [];

    // Primeiro: usa os exemplos existentes (alinhando por índice quando possível).
    for (let i = 0; i < Math.max(baseEn.length, basePt.length); i++) {
        const en = baseEn[i];
        const pt = basePt[i];
        if (!en || !pt) continue;
        pairs.push({ en, pt });
        if (pairs.length >= 3) break;
    }

    // Se ainda assim faltou (dataset atual costuma ter 1 frase), duplica o último par REAL.
    // Isso mantém "3 frases" sem inventar exemplos artificiais.
    while (pairs.length > 0 && pairs.length < 3) pairs.push(pairs[pairs.length - 1]);

    return {
        exampleEn: pairs.length ? pairs.map((p) => p.en) : null,
        examplePtBr: pairs.length ? pairs.map((p) => p.pt) : null,
    };
}

export async function getMostCommonEnglishWords2000(): Promise<MostCommonEnglishWordEntry[]> {
    return WORDS_EN_2000.map((word) => {
        const key = word.toLowerCase();
        const override = MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES[key];

        if (override) {
            const normalized = normalizeExamplePairs({
                word,
                exampleEn: override.exampleEn,
                examplePtBr: override.examplePtBr,
            });
            return {
                word,
                translationPtBr: override.translationPtBr,
                exampleEn: normalized.exampleEn,
                examplePtBr: normalized.examplePtBr,
                context: override.context,
            };
        }

        return {
            word,
            translationPtBr: null,
            exampleEn: null,
            examplePtBr: null,
            context: null,
        };
    });
}
