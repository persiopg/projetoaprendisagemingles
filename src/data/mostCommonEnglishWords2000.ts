import "server-only";

import type { MostCommonEnglishWordEntry } from "./mostCommonEnglishWords2000.types";
import { WORDS_EN_2000 } from "./mostCommonEnglishWords2000.words";
import { MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES } from "./mostCommonEnglishWords2000.generatedOverrides";

export type { MostCommonEnglishWordEntry };

export async function getMostCommonEnglishWords2000(): Promise<MostCommonEnglishWordEntry[]> {
    return WORDS_EN_2000.map((word) => {
        const key = word.toLowerCase();
        const override = MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES[key];

        if (override) return { word, ...override };

        return {
            word,
            translationPtBr: null,
            exampleEn: null,
            examplePtBr: null,
            context: null,
        };
    });
}
