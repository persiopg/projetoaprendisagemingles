export type MostCommonEnglishWordEntryOverride = {
  translationPtBr: string;
  /**
   * Compat: o gerador antigo produzia string.
   * Novo formato pode fornecer até 3 frases.
   */
  exampleEn: string | string[];
  examplePtBr: string | string[];
  context: string;
};

export type MostCommonEnglishWordEntry = {
  word: string;
  translationPtBr: string | null;
  /** Sempre normalizado para 3 itens quando existir. */
  exampleEn: string[] | null;
  /** Sempre normalizado para 3 itens quando existir. */
  examplePtBr: string[] | null;
  context: string | null;
};
