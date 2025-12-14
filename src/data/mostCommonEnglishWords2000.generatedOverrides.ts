import "server-only";

import type { MostCommonEnglishWordEntryOverride } from "./mostCommonEnglishWords2000.types";

// Mantemos overrides gerados (ex.: a partir de um dataset offline do Wiktionary)
// separados dos overrides manuais, para preservar qualidade e permitir revisão.
//
// Regra: manual > gerado > null.
export const MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES: Record<
  string,
  MostCommonEnglishWordEntryOverride
> = {};
