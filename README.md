This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 2000 palavras (offline)

Este projeto gera a lista base de 2000 palavras **offline** (ordenadas por frequência) e preenche tradução/frase/contexto via geração offline.

- Base (2000 palavras): [src/data/mostCommonEnglishWords2000.words.ts](src/data/mostCommonEnglishWords2000.words.ts)
- Dataset gerado: [src/data/mostCommonEnglishWords2000.generatedOverrides.ts](src/data/mostCommonEnglishWords2000.generatedOverrides.ts)

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

## Tatoeba + Argos (offline)

Este projeto usa o corpus do Tatoeba para escolher frases reais em inglês e, quando existir, usar uma tradução humana em português.

- Quando não houver tradução humana disponível para a frase escolhida, a tradução é feita com **Argos Translate (offline)**.
- A tradução da palavra (coluna PT-BR) também é feita via **Argos Translate (offline)**.

Para (re)gerar o dataset:

```bash
npm run gen:tatoeba
```

Sobre licença/atribuição: veja [ATTRIBUTION.md](ATTRIBUTION.md).

## Getting Started

## Banco de dados (setup)

Este projeto usa MySQL e algumas funcionalidades criam tabelas via scripts em `scripts/`.

Para o módulo **Vocabulário** (erros + revisões):

```bash
node scripts/setup-vocab-mistakes-db.js
node scripts/setup-vocab-review-cycles-db.js
```

- `vocab_mistakes`: armazena palavras que você errou.
- `vocab_review_cycles`: controla a regra de revisão (palavras aprendidas há >10 dias voltam para o vocabulário no máximo 3 vezes).

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
