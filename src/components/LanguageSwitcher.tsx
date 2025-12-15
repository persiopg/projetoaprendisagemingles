"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { locales, type Locale } from "@/i18n/locales";
import { ChevronUp, Check } from "lucide-react";

const languages: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  "pt-br": { name: "Português", flag: "🇧🇷" },
  es: { name: "Español", flag: "🇪🇸" },
};

export function LanguageSwitcher({
  currentLocale,
  isCollapsed = false
}: {
  currentLocale: Locale;
  isCollapsed?: boolean;
  label?: string; // Kept for compatibility but unused
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newLocale: Locale) => {
    setIsOpen(false);
    if (newLocale === currentLocale) return;
    
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    router.push(newPath);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors
          ${isCollapsed ? "p-2 justify-center" : "px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"}
        `}
        title={languages[currentLocale].name}
      >
        <span className="text-xl leading-none">{languages[currentLocale].flag}</span>
        {!isCollapsed && (
          <>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {languages[currentLocale].name}
            </span>
            <ChevronUp size={16} className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className={`
          absolute bottom-full mb-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-50 min-w-[160px]
          ${isCollapsed ? "left-0" : "right-0 w-full"}
        `}>
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleSelect(locale)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-xl leading-none">{languages[locale].flag}</span>
              <span className={`text-sm flex-1 ${currentLocale === locale ? "font-semibold text-blue-600" : "text-zinc-700 dark:text-zinc-300"}`}>
                {languages[locale].name}
              </span>
              {currentLocale === locale && <Check size={14} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
