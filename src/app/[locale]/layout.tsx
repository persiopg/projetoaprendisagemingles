import type { ReactNode } from "react";
import { getDictionary } from "@/i18n/getDictionary";
import { Navbar } from "@/components/Navbar";
import { defaultLocale, isLocale } from "@/i18n/locales";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dictionary={dictionary} locale={locale} session={session} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
