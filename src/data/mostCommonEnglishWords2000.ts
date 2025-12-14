import "server-only";

import type { MostCommonEnglishWordEntry } from "./mostCommonEnglishWords2000.types";
import { MOST_COMMON_ENGLISH_WORDS_2000 } from "./mostCommonEnglishWords2000.dataset";

export type { MostCommonEnglishWordEntry };

export async function getMostCommonEnglishWords2000(): Promise<MostCommonEnglishWordEntry[]> {
  return MOST_COMMON_ENGLISH_WORDS_2000;
}
