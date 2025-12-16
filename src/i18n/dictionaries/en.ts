import type { Dictionary } from "@/i18n/types";

export const dictionary: Dictionary = {
  title: "Learn English",
  subtitle: "Pick your language and start learning.",
  languageLabel: "Language",
  mvpNote: "Initial content (MVP). Lessons come next.",

  // Home (landing)
  navExamples: "Examples",
  navBenefits: "Benefits",
  navGetStarted: "Get started",

  homeHeroBadge: "MVP - Early access",
  homeHeroTitle: "Practice English with quick, focused drills",
  homeHeroSubtitle:
    "Flashcards, shadowing, dictation, and reverse translation to turn study into daily practice — with progress and consistency.",
  homeHeroPrimaryCta: "Create account",
  homeHeroSecondaryCta: "I already have an account",

  homeExamplesKicker: "Method",
  homeExamplesTitle: "Examples of what you can practice",
  homeExamplesSubtitle: "Pick the training mode that fits your goal today.",
  homeExamples: [
    {
      title: "Flashcards (2000 words)",
      description:
        "Build vocabulary with cards and examples. Great for foundations and speed.",
      path: "/2000-palavras/flashcards",
      cta: "Open flashcards",
    },
    {
      title: "Shadowing",
      description:
        "Listen and repeat almost at the same time. Trains pronunciation, rhythm, and listening.",
      path: "/shadowing",
      cta: "Train shadowing",
    },
    {
      title: "Dictation",
      description:
        "Listen to the audio and type exactly what you hear. Great for listening + writing.",
      path: "/ditado",
      cta: "Do dictation",
    },
    {
      title: "Reverse Translation",
      description:
        "Read in Portuguese and write in English. Forces you to build sentences in the target language.",
      path: "/traducao-reversa",
      cta: "Practice translation",
    },
  ],

  homeBenefitsTitle: "Benefits of learning with us",
  homeBenefitsSubtitle:
    "We focus on what brings real results and cut unnecessary complexity.",
  homeBenefits: [
    "Short, repeatable sessions: easy to practice daily.",
    "Skill-based activities (listening, speaking, writing, and vocabulary).",
    "User progress tracking: see what you’ve mastered and what’s next.",
    "Content based on common real-life words and phrases.",
  ],
  homeBenefitsDetailed: [
    {
      title: "Short, repeatable sessions",
      description: "Easy to practice every day without friction.",
    },
    {
      title: "All skills covered",
      description: "Drills for listening, speaking, writing, and vocabulary.",
    },
    {
      title: "Progress per user",
      description: "See what you’ve mastered and what’s next.",
    },
    {
      title: "Real-life English",
      description: "Content based on common daily words and phrases.",
    },
  ],

  homeFinalTitle: "Start today and stay consistent",
  homeFinalSubtitle:
    "Create your account and pick a training mode. A few minutes a day already adds up.",
  homeFinalCta: "Sign up",
  homeFinalSecondaryCta: "Log in",

  homeFooterText: "© 2025 Learn English (MVP). All rights reserved.",

  // Dashboard (logged-in home)
  dashboardTitle: "Your dashboard",
  dashboardSubtitle: "Track your progress and keep practicing.",
  dashboardLearnedTitle: "Learned words/phrases",
  dashboardFlashcardsLearnedLabel: "Flashcards (words)",
  dashboardShadowingLearnedLabel: "Shadowing (phrases)",
  dashboardTotalLearnedLabel: "Total (sum)",
  dashboardBestScoresTitle: "Best scores",
  dashboardBestDictationLabel: "Dictation (highest score)",
  dashboardBestReverseTranslationLabel: "Reverse Translation (highest score)",
  dashboardBestOverallLabel: "Best overall",
  dashboardCtaTitle: "Pick a drill for now",
  dashboardCtaSubtitle: "Suggestion: do 5–10 minutes and stop on a high note.",
  dashboardCtaPrimary: "Continue Shadowing",
  dashboardCtaSecondary: "Review Flashcards",

  dashboardStreakLabel: "Streak",

  navTopics: "Main topics",
  navAdvantages: "Advantages",
  navReasons: "Reasons",
  navHome: "Home",
  nav2000Words: "2000 Words",
  navFlashcards: "Flashcards",
  navShadowing: "Shadowing",
  navDictation: "Dictation",
  navReverseTranslation: "Reverse Translation",
  navVocabulary: "Vocabulary",

  ctaPrimary: "Start with the basics",

  topicsTitle: "Main English topics",
  advantagesTitle: "Advantages of learning English",
  reasonsTitle: "Reasons to learn English",

  topics: [
    "Vocabulary",
    "Grammar",
    "Pronunciation",
    "Listening",
    "Speaking",
    "Reading",
    "Writing",
    "Everyday conversation",
  ],
  advantages: [
    "Access more content (courses, articles, videos)",
    "Better career opportunities",
    "More confidence when traveling",
    "Easier to meet people worldwide",
    "Improves your learning and memory habits",
  ],
  reasons: [
    "English is widely used on the internet",
    "Many technologies and tools are documented in English",
    "It helps in studies and certifications",
    "It opens doors to international jobs",
    "It can be fun and rewarding",
  ],

  // Auth
  loginTitle: "log in",
  loginEmailPlaceholder: "User (Email)",
  loginPasswordPlaceholder: "password",
  loginForgotPassword: "forgot password?",
  loginButton: "Login",
  loginNoAccount: "Don't have any account?",
  loginRegisterLink: "Register",
  loginErrorInvalid: "Invalid email or password",
  loginErrorGeneric: "An error occurred during login",

  registerTitle: "register",
  registerNamePlaceholder: "Full Name",
  registerEmailPlaceholder: "Email Address",
  registerPasswordPlaceholder: "Password",
  registerButton: "Register",
  registerHasAccount: "Already have an account?",
  registerLoginLink: "Log in",
  registerErrorGeneric: "An error occurred during registration",
};
