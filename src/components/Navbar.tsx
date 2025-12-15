import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/locales";
import { Session } from "next-auth";

interface NavbarProps {
  dictionary: Dictionary;
  locale: Locale;
  session: Session | null;
}

export function Navbar({ dictionary, locale, session }: NavbarProps) {
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
            {session && (
              <Link
                href={`/${locale}/meus-flashcards`}
                className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-50"
              >
                Meus Flashcards
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLocale={locale} label={dictionary.languageLabel} />
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {session.user?.name}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-50"
              >
                Sair
              </Link>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
