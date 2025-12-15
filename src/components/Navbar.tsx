import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/locales";

interface NavbarProps {
  dictionary: Dictionary;
  locale: Locale;
}

export function Navbar({ dictionary, locale }: NavbarProps) {
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {dictionary.title}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}`}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {dictionary.navHome}
            </Link>
            <Link
              href={`/${locale}/2000-palavras`}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {dictionary.nav2000Words}
            </Link>
            <Link
              href={`/${locale}/2000-palavras/flashcards`}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {dictionary.navFlashcards}
            </Link>
          </div>
        </div>
        <LanguageSwitcher currentLocale={locale} label={dictionary.languageLabel} />
      </div>
    </nav>
  );
}
