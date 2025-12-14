export type MostCommonEnglishWordEntryOverride = {
  translationPtBr: string;
  exampleEn: string;
  examplePtBr: string;
  context: string;
};

export type MostCommonEnglishWordEntry = {
  word: string;
  translationPtBr: string | null;
  exampleEn: string | null;
  examplePtBr: string | null;
  context: string | null;
};
