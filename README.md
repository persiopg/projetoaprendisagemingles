This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 2000 palavras (offline)

Este projeto gera a lista base de 2000 palavras **offline** (ordenadas por frequência) e preenche tradução/frase/contexto via overrides.

- Base (2000 palavras): [src/data/mostCommonEnglishWords2000.words.ts](src/data/mostCommonEnglishWords2000.words.ts)
- Overrides manuais (qualidade): [src/data/mostCommonEnglishWords2000.manualOverrides.ts](src/data/mostCommonEnglishWords2000.manualOverrides.ts)
- Overrides gerados (opcional): [src/data/mostCommonEnglishWords2000.generatedOverrides.ts](src/data/mostCommonEnglishWords2000.generatedOverrides.ts)

Regra de prioridade: **manual > gerado > vazio**.

### Regerar a base (offline)

Gera/regera `WORDS_EN_2000` a partir do arquivo local do pacote `most-common-words-by-language`:

```bash
npm run gen:words
```

### Ver quantas faltam

Mostra quantas palavras da base ainda estão sem override preenchido:

```bash
npm run count:words
```

## Wiktionary offline (CC BY-SA)

Dá para usar um dump offline do Wiktionary para **sugerir** traduções/exemplos/contexto e gerar overrides.

- O Wiktionary **não** é uma fonte de frequência: para manter a ordem “mais comuns”, a base continua vindo da lista de frequência.
- Se você copiar textos/exemplos/definições do Wiktionary para o repositório, isso cria obrigações de **atribuição** e **share-alike** (CC BY-SA) para o material derivado.

### Gerar overrides a partir do dump (Kaikki JSONL)

Pré-requisito: ter o arquivo em `web/data/wiktionary/kaikki.org-dictionary-English.jsonl`.

Gera `src/data/mostCommonEnglishWords2000.generatedOverrides.ts` (camada "gerado"), mantendo a prioridade do manual:

```bash
npm run gen:wiktionary
```

Sobre licença/atribuição: veja [ATTRIBUTION.md](ATTRIBUTION.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
