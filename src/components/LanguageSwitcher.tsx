"use client";

import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;

    // Redirect to the new locale path
    if (!pathname) return;

    const segments = pathname.split("/");
    // segments[0] is empty because path starts with /
    // segments[1] is the locale
    segments[1] = newLocale;
    const newPath = segments.join("/");

    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="language-select" className="font-medium text-zinc-950 dark:text-zinc-50">
        {label}:
      </label>
      <select
        id="language-select"
        value={currentLocale}
        onChange={handleChange}
        className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {labels[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
