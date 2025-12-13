"use client";

import Link from "next/link";

import { locales, type Locale } from "@/i18n/locales";

const labels: Record<Locale, string> = {
  en: "English",
  "pt-br": "Português (Brasil)",
  es: "Español",
};

export function LanguageSwitcher({
  currentLocale,
  label,
}: {
  currentLocale: Locale;
  label: string;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
      <span className="font-medium text-zinc-950 dark:text-zinc-50">{label}:</span>
      <div className="flex flex-wrap gap-2">
        {locales.map((locale) => {
          const isActive = locale === currentLocale;
          return (
            <Link
              key={locale}
              href={`/${locale}`}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "rounded-full border border-solid border-black/[.08] px-3 py-1 text-zinc-950 dark:border-white/[.145] dark:text-zinc-50"
                  : "rounded-full border border-solid border-black/[.08] px-3 py-1 hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              }
            >
              {labels[locale]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
