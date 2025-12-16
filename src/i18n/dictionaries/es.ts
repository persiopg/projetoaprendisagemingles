import type { Dictionary } from "@/i18n/types";

export const dictionary: Dictionary = {
  title: "Aprende Inglés",
  subtitle: "Elige tu idioma y empieza a aprender.",
  languageLabel: "Idioma",
  mvpNote: "Contenido inicial (MVP). Las lecciones vienen después.",

  // Home (landing)
  navExamples: "Ejemplos",
  navBenefits: "Ventajas",
  navGetStarted: "Empezar",

  homeHeroBadge: "MVP - Acceso anticipado",
  homeHeroTitle: "Practica inglés con entrenamientos rápidos y enfocados",
  homeHeroSubtitle:
    "Flashcards, shadowing, dictado y traducción inversa para convertir el estudio en práctica diaria — con progreso y constancia.",
  homeHeroPrimaryCta: "Crear cuenta",
  homeHeroSecondaryCta: "Ya tengo una cuenta",

  homeExamplesKicker: "Metodología",
  homeExamplesTitle: "Ejemplos de lo que puedes practicar",
  homeExamplesSubtitle:
    "Elige el modo de entrenamiento que mejor se adapte a tu objetivo.",
  homeExamples: [
    {
      title: "Flashcards (2000 palabras)",
      description:
        "Construye vocabulario con tarjetas y ejemplos. Ideal para base y velocidad.",
      path: "/2000-palavras/flashcards",
      cta: "Abrir flashcards",
    },
    {
      title: "Shadowing",
      description:
        "Escucha y repite casi al mismo tiempo. Entrena pronunciación, ritmo y comprensión.",
      path: "/shadowing",
      cta: "Practicar shadowing",
    },
    {
      title: "Dictado",
      description:
        "Escucha el audio y escribe exactamente lo que oyes. Excelente para listening + escritura.",
      path: "/ditado",
      cta: "Hacer dictado",
    },
    {
      title: "Traducción Inversa",
      description:
        "Lee en portugués y escribe en inglés. Obliga a construir frases en el idioma objetivo.",
      path: "/traducao-reversa",
      cta: "Practicar traducción",
    },
  ],

  homeBenefitsTitle: "Ventajas de aprender con nosotros",
  homeBenefitsSubtitle:
    "Nos enfocamos en lo que da resultados reales y eliminamos complejidad innecesaria.",
  homeBenefits: [
    "Sesiones cortas y repetibles: fácil practicar a diario.",
    "Actividades por habilidad (escuchar, hablar, escribir y vocabulario).",
    "Seguimiento de progreso: ves lo que ya dominas y lo que sigue.",
    "Contenido basado en palabras y frases comunes del día a día.",
  ],
  homeBenefitsDetailed: [
    {
      title: "Sesiones cortas y repetibles",
      description: "Fácil de practicar cada día sin complicaciones.",
    },
    {
      title: "Enfoque en todas las habilidades",
      description: "Ejercicios para escuchar, hablar, escribir y vocabulario.",
    },
    {
      title: "Progreso por usuario",
      description: "Ves lo que ya dominas y lo que sigue.",
    },
    {
      title: "Inglés de la vida real",
      description: "Contenido con palabras y frases comunes del día a día.",
    },
  ],

  homeFinalTitle: "Empieza hoy y mantén la constancia",
  homeFinalSubtitle:
    "Crea tu cuenta y elige un modo de entrenamiento. Unos minutos al día ya suman.",
  homeFinalCta: "Registrarse",
  homeFinalSecondaryCta: "Entrar",

  homeFooterText: "© 2025 Aprende Inglés (MVP). Todos los derechos reservados.",

  // Dashboard (logged-in home)
  dashboardTitle: "Tu panel",
  dashboardSubtitle: "Sigue tu progreso y vuelve a practicar.",
  dashboardLearnedTitle: "Palabras/frases aprendidas",
  dashboardFlashcardsLearnedLabel: "Flashcards (palabras)",
  dashboardShadowingLearnedLabel: "Shadowing (frases)",
  dashboardTotalLearnedLabel: "Total (suma)",
  dashboardBestScoresTitle: "Mejores puntuaciones",
  dashboardBestDictationLabel: "Dictado (mayor puntuación)",
  dashboardBestReverseTranslationLabel: "Traducción Inversa (mayor puntuación)",
  dashboardBestOverallLabel: "Mejor general",
  dashboardCtaTitle: "Elige un entrenamiento ahora",
  dashboardCtaSubtitle: "Sugerencia: haz 5–10 minutos y detente en el mejor momento.",
  dashboardCtaPrimary: "Continuar Shadowing",
  dashboardCtaSecondary: "Repasar Flashcards",

  dashboardStreakLabel: "Racha (días consecutivos)",

  navTopics: "Temas principales",
  navAdvantages: "Ventajas",
  navReasons: "Motivos",
  navHome: "Inicio",
  nav2000Words: "2000 Palabras",
  navFlashcards: "Flashcards",
  navShadowing: "Shadowing",
  navDictation: "Dictado",
  navReverseTranslation: "Traducción Inversa",
  navVocabulary: "Vocabulario",

  ctaPrimary: "Empezar con lo básico",

  topicsTitle: "Temas principales del inglés",
  advantagesTitle: "Ventajas de aprender inglés",
  reasonsTitle: "Motivos para aprender inglés",

  topics: [
    "Vocabulario",
    "Gramática",
    "Pronunciación",
    "Escucha (listening)",
    "Hablar (speaking)",
    "Lectura",
    "Escritura",
    "Conversación cotidiana",
  ],
  advantages: [
    "Acceso a más contenido (cursos, artículos, videos)",
    "Mejores oportunidades laborales",
    "Más confianza al viajar",
    "Más fácil conocer gente en todo el mundo",
    "Mejora hábitos de estudio y memoria",
  ],
  reasons: [
    "El inglés se usa mucho en internet",
    "Mucha tecnología está documentada en inglés",
    "Ayuda en estudios y certificaciones",
    "Abre puertas a trabajos internacionales",
    "Puede ser divertido y gratificante",
  ],

  // Auth
  loginTitle: "iniciar sesión",
  loginEmailPlaceholder: "Usuario (Email)",
  loginPasswordPlaceholder: "contraseña",
  loginForgotPassword: "¿olvidaste tu contraseña?",
  loginButton: "Entrar",
  loginNoAccount: "¿No tienes una cuenta?",
  loginRegisterLink: "Regístrate",
  loginErrorInvalid: "Email o contraseña inválidos",
  loginErrorGeneric: "Ocurrió un error al iniciar sesión",

  registerTitle: "registrarse",
  registerNamePlaceholder: "Nombre Completo",
  registerEmailPlaceholder: "Dirección de Email",
  registerPasswordPlaceholder: "Contraseña",
  registerButton: "Registrar",
  registerHasAccount: "¿Ya tienes una cuenta?",
  registerLoginLink: "Iniciar sesión",
  registerErrorGeneric: "Ocurrió un error al registrarse",
};
