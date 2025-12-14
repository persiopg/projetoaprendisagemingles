import "server-only";

import type { MostCommonEnglishWordEntry } from "./mostCommonEnglishWords2000.types";
import { WORDS_EN_2000 } from "./mostCommonEnglishWords2000.words";
import { MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES } from "./mostCommonEnglishWords2000.generatedOverrides";
import { MOST_COMMON_ENGLISH_WORDS_2000_MANUAL_OVERRIDES } from "./mostCommonEnglishWords2000.manualOverrides";

export type { MostCommonEnglishWordEntry };

export async function getMostCommonEnglishWords2000(): Promise<MostCommonEnglishWordEntry[]> {
    return WORDS_EN_2000.map((word) => {
        const key = word.toLowerCase();
        const manualOverride = MOST_COMMON_ENGLISH_WORDS_2000_MANUAL_OVERRIDES[key];
        const generatedOverride = MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES[key];

        const override = manualOverride ?? generatedOverride;
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
