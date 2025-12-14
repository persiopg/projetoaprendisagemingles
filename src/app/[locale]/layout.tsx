import type { ReactNode } from "react";
import { getDictionary } from "@/i18n/getDictionary";
import { Navbar } from "@/components/Navbar";
import type { Locale } from "@/i18n/locales";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dictionary={dictionary} locale={locale} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
