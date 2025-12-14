import { notFound } from "next/navigation";

import { getDictionary } from "@/i18n/getDictionary";
import { isLocale, locales, type Locale } from "@/i18n/locales";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Next 16: `params` pode ser Promise e precisa ser awaited.
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {dict.title}
            </h1>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{dict.mvpNote}</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <nav className="flex flex-wrap gap-2 text-sm">
              <a
                href="#topics"
                className="rounded-full border border-solid border-black/8 px-3 py-1 text-zinc-950 hover:bg-black/4 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/8"
              >
                {dict.navTopics}
              </a>
              <a
                href="#advantages"
                className="rounded-full border border-solid border-black/8 px-3 py-1 text-zinc-950 hover:bg-black/4 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/8"
              >
                {dict.navAdvantages}
              </a>
              <a
                href="#reasons"
                className="rounded-full border border-solid border-black/8 px-3 py-1 text-zinc-950 hover:bg-black/4 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/8"
              >
                {dict.navReasons}
              </a>
            </nav>
          </div>
        </header>

        <main className="mt-10 flex flex-col gap-14">
          <section className="rounded-2xl border border-solid border-black/8 bg-white p-8 dark:border-white/[.145] dark:bg-black">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-3">
                <h2 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
                  {dict.subtitle}
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                  {locale === "pt-br" &&
                    "Aqui você vai estudar vocabulário, gramática e conversação com foco no dia a dia."}
                  {locale === "en" &&
                    "Here you’ll study vocabulary, grammar, and conversation with real-life focus."}
                  {locale === "es" &&
                    "Aquí estudiarás vocabulario, gramática y conversación con enfoque en lo cotidiano."}
                </p>
              </div>

              <a
                href="#topics"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-black/80 dark:hover:bg-white/80"
              >
                {dict.ctaPrimary}
              </a>
            </div>
          </section>

          <section id="topics" className="flex flex-col gap-5">
            <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {dict.topicsTitle}
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {dict.topics.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-solid border-black/8 bg-white px-5 py-4 text-zinc-950 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="advantages" className="flex flex-col gap-5">
            <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {dict.advantagesTitle}
            </h3>
            <ul className="grid gap-3">
              {dict.advantages.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-solid border-black/8 bg-white px-5 py-4 text-zinc-600 dark:border-white/[.145] dark:bg-black dark:text-zinc-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="reasons" className="flex flex-col gap-5">
            <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {dict.reasonsTitle}
            </h3>
            <ul className="grid gap-3">
              {dict.reasons.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-solid border-black/8 bg-white px-5 py-4 text-zinc-600 dark:border-white/[.145] dark:bg-black dark:text-zinc-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
