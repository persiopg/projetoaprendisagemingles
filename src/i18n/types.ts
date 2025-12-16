export type Dictionary = {
  title: string;
  subtitle: string;
  languageLabel: string;
  mvpNote: string;

  // Home (landing)
  navExamples: string;
  navBenefits: string;
  navGetStarted: string;

  homeHeroBadge: string;
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeHeroPrimaryCta: string;
  homeHeroSecondaryCta: string;

  homeExamplesKicker: string;
  homeExamplesTitle: string;
  homeExamplesSubtitle: string;
  homeExamples: Array<{
    title: string;
    description: string;
    path: string;
    cta: string;
  }>;

  homeBenefitsTitle: string;
  homeBenefitsSubtitle: string;
  homeBenefits: string[];
  homeBenefitsDetailed: Array<{
    title: string;
    description: string;
  }>;

  homeFinalTitle: string;
  homeFinalSubtitle: string;
  homeFinalCta: string;
  homeFinalSecondaryCta: string;

  homeFooterText: string;

  // Dashboard (logged-in home)
  dashboardTitle: string;
  dashboardSubtitle: string;
  dashboardLearnedTitle: string;
  dashboardFlashcardsLearnedLabel: string;
  dashboardShadowingLearnedLabel: string;
  dashboardTotalLearnedLabel: string;
  dashboardBestScoresTitle: string;
  dashboardBestDictationLabel: string;
  dashboardBestReverseTranslationLabel: string;
  dashboardBestOverallLabel: string;
  dashboardCtaTitle: string;
  dashboardCtaSubtitle: string;
  dashboardCtaPrimary: string;
  dashboardCtaSecondary: string;

  dashboardStreakLabel: string;

  navTopics: string;
  navAdvantages: string;
  navReasons: string;
  navHome: string;
  nav2000Words: string;
  navFlashcards: string;
  navShadowing: string;
  navDictation: string;
  navReverseTranslation: string;
  navVocabulary: string;

  ctaPrimary: string;

  topicsTitle: string;
  advantagesTitle: string;
  reasonsTitle: string;

  topics: string[];
  advantages: string[];
  reasons: string[];

  // Auth
  loginTitle: string;
  loginEmailPlaceholder: string;
  loginPasswordPlaceholder: string;
  loginForgotPassword: string;
  loginButton: string;
  loginNoAccount: string;
  loginRegisterLink: string;
  loginErrorInvalid: string;
  loginErrorGeneric: string;

  registerTitle: string;
  registerNamePlaceholder: string;
  registerEmailPlaceholder: string;
  registerPasswordPlaceholder: string;
  registerButton: string;
  registerHasAccount: string;
  registerLoginLink: string;
  registerErrorGeneric: string;
};
