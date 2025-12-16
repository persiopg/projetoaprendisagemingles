import type { Dictionary } from "@/i18n/types";

export const dictionary: Dictionary = {
  title: "Aprenda Inglês",
  subtitle: "Escolha seu idioma e comece a aprender.",
  languageLabel: "Idioma",
  mvpNote: "Conteúdo inicial (MVP). As lições virão em seguida.",

  // Home (landing)
  navExamples: "Exemplos",
  navBenefits: "Vantagens",
  navGetStarted: "Começar",

  homeHeroBadge: "MVP - Acesso antecipado",
  homeHeroTitle: "Pratique inglês com treinos rápidos e objetivos",
  homeHeroSubtitle:
    "Flashcards, shadowing, ditado e tradução reversa para transformar estudo em prática diária — com progresso e consistência.",
  homeHeroPrimaryCta: "Criar conta",
  homeHeroSecondaryCta: "Já tenho conta",

  homeExamplesKicker: "Metodologia",
  homeExamplesTitle: "Exemplos do que você encontra aqui",
  homeExamplesSubtitle:
    "Escolha o modo de treino que mais se adapta ao seu momento e objetivo.",
  homeExamples: [
    {
      title: "Flashcards (2000 palavras)",
      description:
        "Memorize vocabulário com cartões e exemplos. Ideal para criar base e ganhar velocidade.",
      path: "/2000-palavras/flashcards",
      cta: "Ver flashcards",
    },
    {
      title: "Shadowing",
      description:
        "Ouça e repita quase ao mesmo tempo. Treina pronúncia, ritmo e compreensão oral.",
      path: "/shadowing",
      cta: "Treinar shadowing",
    },
    {
      title: "Ditado",
      description:
        "Escute o áudio e digite exatamente o que ouvir. Ótimo para listening + escrita.",
      path: "/ditado",
      cta: "Fazer ditado",
    },
    {
      title: "Tradução Reversa",
      description:
        "Leia em português e escreva em inglês. Força seu cérebro a construir frases na língua alvo.",
      path: "/traducao-reversa",
      cta: "Praticar tradução",
    },
  ],

  homeBenefitsTitle: "Vantagens de aprender com a gente",
  homeBenefitsSubtitle:
    "Focamos naquilo que traz resultado real, eliminando a complexidade desnecessária.",
  homeBenefits: [
    "Treinos curtos e repetíveis: dá para praticar todos os dias.",
    "Atividades focadas em habilidade (ouvir, falar, escrever e vocabulário).",
    "Progresso por usuário: você vê o que já dominou e o que falta.",
    "Conteúdo baseado em palavras e frases comuns do dia a dia.",
  ],
  homeBenefitsDetailed: [
    {
      title: "Treinos curtos e repetíveis",
      description:
        "Dá para praticar todos os dias, encaixando na sua rotina sem sofrimento.",
    },
    {
      title: "Foco em todas as habilidades",
      description:
        "Atividades para ouvir, falar, escrever e expandir seu vocabulário.",
    },
    {
      title: "Progresso por usuário",
      description:
        "Um jeito simples de ver o que você já dominou e o que ainda falta.",
    },
    {
      title: "Inglês da vida real",
      description:
        "Conteúdo baseado em palavras e frases comuns do dia a dia.",
    },
  ],

  homeFinalTitle: "Comece hoje e mantenha consistência",
  homeFinalSubtitle:
    "Crie sua conta e escolha um modo de treino. Em poucos minutos por dia você já evolui.",
  homeFinalCta: "Cadastrar",
  homeFinalSecondaryCta: "Entrar",

  homeFooterText: "© 2025 Aprenda Inglês (MVP). Todos os direitos reservados.",

  // Dashboard (logged-in home)
  dashboardTitle: "Seu painel",
  dashboardSubtitle: "Acompanhe seu progresso e volte a praticar.",
  dashboardLearnedTitle: "Palavras/frases aprendidas",
  dashboardFlashcardsLearnedLabel: "Flashcards (palavras)",
  dashboardShadowingLearnedLabel: "Shadowing (frases)",
  dashboardTotalLearnedLabel: "Total (soma)",
  dashboardBestScoresTitle: "Melhores scores",
  dashboardBestDictationLabel: "Ditado (maior score)",
  dashboardBestReverseTranslationLabel: "Tradução Reversa (maior score)",
  dashboardBestOverallLabel: "Melhor geral",
  dashboardCtaTitle: "Escolha um treino para agora",
  dashboardCtaSubtitle: "Sugestão: faça 5–10 minutos e pare no auge.",
  dashboardCtaPrimary: "Continuar no Shadowing",
  dashboardCtaSecondary: "Revisar Flashcards",

  dashboardStreakLabel: "Dias consecutivos",

  navTopics: "Principais tópicos",
  navAdvantages: "Vantagens",
  navReasons: "Motivos",
  navHome: "Início",
  nav2000Words: "2000 Palavras",
  navFlashcards: "Flashcards",
  navShadowing: "Shadowing",
  navDictation: "Ditado",
  navReverseTranslation: "Tradução Reversa",
  navVocabulary: "Vocabulário",

  ctaPrimary: "Começar pelo básico",

  topicsTitle: "Principais tópicos do inglês",
  advantagesTitle: "Vantagens de aprender inglês",
  reasonsTitle: "Motivos para aprender inglês",

  topics: [
    "Vocabulário",
    "Gramática",
    "Pronúncia",
    "Escuta (listening)",
    "Fala (speaking)",
    "Leitura",
    "Escrita",
    "Conversação do dia a dia",
  ],
  advantages: [
    "Acesso a mais conteúdo (cursos, artigos, vídeos)",
    "Melhores oportunidades de carreira",
    "Mais confiança em viagens",
    "Facilita conhecer pessoas no mundo todo",
    "Melhora hábitos de estudo e memória",
  ],
  reasons: [
    "O inglês é muito usado na internet",
    "Muita tecnologia é documentada em inglês",
    "Ajuda em estudos e certificações",
    "Abre portas para vagas internacionais",
    "Pode ser divertido e recompensador",
  ],

  // Auth
  loginTitle: "entrar",
  loginEmailPlaceholder: "Usuário (Email)",
  loginPasswordPlaceholder: "senha",
  loginForgotPassword: "esqueceu a senha?",
  loginButton: "Entrar",
  loginNoAccount: "Não tem uma conta?",
  loginRegisterLink: "Registre-se",
  loginErrorInvalid: "Email ou senha inválidos",
  loginErrorGeneric: "Ocorreu um erro ao fazer login",

  registerTitle: "registrar",
  registerNamePlaceholder: "Nome Completo",
  registerEmailPlaceholder: "Endereço de Email",
  registerPasswordPlaceholder: "Senha",
  registerButton: "Registrar",
  registerHasAccount: "Já tem uma conta?",
  registerLoginLink: "Entrar",
  registerErrorGeneric: "Ocorreu um erro ao registrar",
};
