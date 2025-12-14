export type MostCommonEnglishWordEntry = {
  word: string;
  translationPtBr: string | null;
  exampleEn: string | null;
  examplePtBr: string | null;
  context: string | null;
};

export type MostCommonEnglishWordEntryOverride = Omit<MostCommonEnglishWordEntry, "word">;
