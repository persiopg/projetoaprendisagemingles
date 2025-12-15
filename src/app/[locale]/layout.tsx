import type { ReactNode } from "react";
import { getDictionary } from "@/i18n/getDictionary";
import { Sidebar } from "@/components/Sidebar";
import { defaultLocale, isLocale } from "@/i18n/locales";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden">
      <Sidebar dictionary={dictionary} locale={locale} session={session} />
      <main className="flex-1 overflow-y-auto h-full">
        {children}
      </main>
    </div>
  );
}
