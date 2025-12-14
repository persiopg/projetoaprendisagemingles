# Atribuição (Tatoeba)

Este projeto pode gerar dados em [src/data/mostCommonEnglishWords2000.generatedOverrides.ts](src/data/mostCommonEnglishWords2000.generatedOverrides.ts) usando o corpus do Tatoeba para obter frases reais em inglês e, quando possível, traduções humanas em português.

- Fonte: Tatoeba (exports semanais): https://tatoeba.org/pt-br/downloads
- Licença (conforme página de downloads): **CC BY 2.0 FR** (e parte do conteúdo também pode estar em CC0)

Recomendação prática:
- Mantenha os arquivos baixados em `web/data/tatoeba/` fora do git (veja [web/.gitignore](.gitignore)).
- Registre a data do download/geração ao publicar dados derivados.

Observação: quando não houver tradução humana disponível para a frase escolhida, este projeto usa **Argos Translate (offline)** como fallback para gerar a tradução em PT.
