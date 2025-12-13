import type { Dictionary } from "./types";
import type { Locale } from "./locales";

import { dictionary as en } from "./dictionaries/en";
import { dictionary as es } from "./dictionaries/es";
import { dictionary as ptBr } from "./dictionaries/pt-br";

export function getDictionary(locale: Locale): Dictionary {
  switch (locale) {
    case "pt-br":
      return ptBr;
    case "es":
      return es;
    case "en":
    default:
      return en;
  }
}
