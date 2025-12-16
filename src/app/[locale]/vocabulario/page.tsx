import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/locales";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VocabularioClient } from "./VocabularioClient";

export const dynamic = "force-dynamic";

export default async function VocabularioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/vocabulario`);
  }

  const dict = getDictionary(locale as Locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center text-zinc-900 dark:text-zinc-50">
        {dict.navVocabulary}
      </h1>
      <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8 mx-auto">
        {locale === "pt-br"
          ? "Aqui ficam as palavras que você errou. A revisão muda conforme a origem (EN→PT ou PT→EN)."
          : locale === "es"
            ? "Aquí quedan las palabras que fallaste. La revisión cambia según el origen (EN→PT o PT→EN)."
            : "Here are the words you got wrong. Review changes by source (EN→PT or PT→EN)."}
      </p>

      <VocabularioClient locale={locale} />
    </div>
  );
}
