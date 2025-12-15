const { MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES } = require('../src/data/mostCommonEnglishWords2000.generatedOverrides.ts');

console.log('Overrides count:', Object.keys(MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES).length);
console.log('Keys:', Object.keys(MOST_COMMON_ENGLISH_WORDS_2000_GENERATED_OVERRIDES).slice(0, 10));
