import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import type { RowDataPacket } from "mysql2";
import {
  ArrowRight,
  CheckCircle2,
  Keyboard,
  Layers,
  Mic,
  Repeat,
} from "lucide-react";

import { getDictionary } from "@/i18n/getDictionary";
import { isLocale, locales, type Locale } from "@/i18n/locales";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamicParams = false;
export const dynamic = "force-dynamic";

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

  const session = await getServerSession(authOptions);

  const getCountSafe = async (query: string, values: unknown[]) => {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(query, values);
      const count = rows?.[0]?.count;
      return typeof count === "number" ? count : Number(count ?? 0);
    } catch (error: any) {
      // Alguns ambientes podem não ter todas as tabelas criadas ainda.
      if (error?.code === "ER_NO_SUCH_TABLE") {
        return 0;
      }
      throw error;
    }
  };

  const getMaxSafe = async (query: string, values: unknown[]) => {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(query, values);
      const maxScore = rows?.[0]?.maxScore;
      if (maxScore === null || maxScore === undefined) return null;
      return typeof maxScore === "number" ? maxScore : Number(maxScore);
    } catch (error: any) {
      if (error?.code === "ER_NO_SUCH_TABLE") {
        return null;
      }
      throw error;
    }
  };

  const dashboardStats = async () => {
    if (!session?.user?.email) {
      return null;
    }

    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [session.user.email]
    );

    const userId = users?.[0]?.id;
    if (!userId) {
      return {
        flashcardsLearned: 0,
        shadowingLearned: 0,
        bestDictationScore: null as number | null,
        bestReverseTranslationScore: null as number | null,
      };
    }

    const [flashcardsLearned, shadowingLearned, bestDictationScore, bestReverseTranslationScore] =
      await Promise.all([
        getCountSafe(
          "SELECT COUNT(*) as count FROM flashcard_progress WHERE user_id = ? AND is_learned = 1",
          [userId]
        ),
        getCountSafe(
          "SELECT COUNT(*) as count FROM shadowing_progress WHERE user_id = ? AND is_learned = 1",
          [userId]
        ),
        getMaxSafe(
          "SELECT MAX(score) as maxScore FROM dictation_progress WHERE user_id = ?",
          [userId]
        ),
        getMaxSafe(
          "SELECT MAX(score) as maxScore FROM reverse_translation_progress WHERE user_id = ?",
          [userId]
        ),
      ]);

    return {
      flashcardsLearned,
      shadowingLearned,
      bestDictationScore,
      bestReverseTranslationScore,
    };
  };

  const stats = await dashboardStats();
  const isLoggedIn = Boolean(session?.user?.email);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {dict.title}
            </h1>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{dict.mvpNote}</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            {!isLoggedIn ? (
              <nav className="flex flex-wrap gap-2 text-sm">
                <a
                  href="#examples"
                  className="rounded-full border border-solid border-black/8 px-3 py-1 text-zinc-950 hover:bg-black/4 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/8"
                >
                  {dict.navExamples}
                </a>
                <a
                  href="#benefits"
                  className="rounded-full border border-solid border-black/8 px-3 py-1 text-zinc-950 hover:bg-black/4 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/8"
                >
                  {dict.navBenefits}
                </a>
                <a
                  href="#get-started"
                  className="rounded-full border border-solid border-black/8 px-3 py-1 text-zinc-950 hover:bg-black/4 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/8"
                >
                  {dict.navGetStarted}
                </a>
              </nav>
            ) : null}
          </div>
        </header>

        <main className="mt-10 flex flex-col gap-14">
          {isLoggedIn && stats ? (
            <>
              <section className="rounded-2xl border border-solid border-black/8 bg-white p-8 dark:border-white/[.145] dark:bg-black">
                <div className="flex flex-col gap-3">
                  <h2 className="text-3xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
                    {dict.dashboardTitle}
                  </h2>
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {dict.dashboardSubtitle}
                  </p>
                </div>
              </section>

              <section className="flex flex-col gap-5">
                <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
                  {dict.dashboardLearnedTitle}
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Link
                    href={`/${locale}/2000-palavras/flashcards`}
                    className="rounded-2xl border border-solid border-black/8 bg-white p-6 hover:bg-black/4 dark:border-white/[.145] dark:bg-black dark:hover:bg-white/8"
                  >
                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {dict.dashboardFlashcardsLearnedLabel}
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      {stats.flashcardsLearned}
                    </div>
                  </Link>

                  <Link
                    href={`/${locale}/shadowing`}
                    className="rounded-2xl border border-solid border-black/8 bg-white p-6 hover:bg-black/4 dark:border-white/[.145] dark:bg-black dark:hover:bg-white/8"
                  >
                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {dict.dashboardShadowingLearnedLabel}
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      {stats.shadowingLearned}
                    </div>
                  </Link>

                  <div className="rounded-2xl border border-solid border-black/8 bg-white p-6 dark:border-white/[.145] dark:bg-black">
                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {dict.dashboardTotalLearnedLabel}
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      {stats.flashcardsLearned + stats.shadowingLearned}
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-5">
                <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
                  {dict.dashboardBestScoresTitle}
                </h3>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Link
                    href={`/${locale}/ditado`}
                    className="rounded-2xl border border-solid border-black/8 bg-white p-6 hover:bg-black/4 dark:border-white/[.145] dark:bg-black dark:hover:bg-white/8"
                  >
                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {dict.dashboardBestDictationLabel}
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      {stats.bestDictationScore ?? 0}
                    </div>
                  </Link>

                  <Link
                    href={`/${locale}/traducao-reversa`}
                    className="rounded-2xl border border-solid border-black/8 bg-white p-6 hover:bg-black/4 dark:border-white/[.145] dark:bg-black dark:hover:bg-white/8"
                  >
                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {dict.dashboardBestReverseTranslationLabel}
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      {stats.bestReverseTranslationScore ?? 0}
                    </div>
                  </Link>

                  <div className="rounded-2xl border border-solid border-black/8 bg-white p-6 dark:border-white/[.145] dark:bg-black">
                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {dict.dashboardBestOverallLabel}
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      {Math.max(stats.bestDictationScore ?? 0, stats.bestReverseTranslationScore ?? 0)}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-solid border-black/8 bg-white p-8 dark:border-white/[.145] dark:bg-black">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
                      {dict.dashboardCtaTitle}
                    </h3>
                    <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {dict.dashboardCtaSubtitle}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      href={`/${locale}/shadowing`}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-black/80 dark:hover:bg-white/80"
                    >
                      {dict.dashboardCtaPrimary}
                    </Link>
                    <Link
                      href={`/${locale}/2000-palavras/flashcards`}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-solid border-black/8 px-6 text-sm font-medium text-zinc-950 hover:bg-black/4 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/8"
                    >
                      {dict.dashboardCtaSecondary}
                    </Link>
                  </div>
                </div>
              </section>
            </>
          ) : null}

          {!isLoggedIn ? (
            <>
              <section className="relative overflow-hidden rounded-2xl border border-solid border-black/8 bg-white dark:border-white/[.145] dark:bg-black">
                <div className="grid lg:grid-cols-2">
                  <div className="px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
                    <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      {dict.homeHeroBadge}
                    </div>

                    <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
                      <span className="block">{dict.homeHeroTitle}</span>
                    </h2>

                    <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
                      {dict.homeHeroSubtitle}
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={`/${locale}/register`}
                        className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        {dict.homeHeroPrimaryCta}
                      </Link>
                      <Link
                        href={`/${locale}/login`}
                        className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-50 px-8 text-base font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                      >
                        {dict.homeHeroSecondaryCta}
                      </Link>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center justify-center bg-zinc-50 p-10 dark:bg-zinc-950">
                    <div className="grid grid-cols-2 gap-4">
                      {[{ Icon: Layers }, { Icon: Mic }, { Icon: Keyboard }, { Icon: Repeat }].map(
                        ({ Icon }, index) => (
                          <div
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            className="rounded-2xl border border-solid border-black/8 bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black"
                          >
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="h-2 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                            <div className="mt-2 h-2 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section id="examples" className="py-8">
                <div className="text-center">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {dict.homeExamplesKicker}
                  </h3>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
                    {dict.homeExamplesTitle}
                  </p>
                  <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
                    {dict.homeExamplesSubtitle}
                  </p>
                </div>

                <div className="mt-10 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {dict.homeExamples.map((example) => {
                    const Icon =
                      example.path.includes("flashcards")
                        ? Layers
                        : example.path.includes("shadowing")
                          ? Mic
                          : example.path.includes("ditado")
                            ? Keyboard
                            : Repeat;

                    const meta =
                      example.path.includes("flashcards") ? dict.nav2000Words : undefined;

                    return (
                      <div
                        key={example.path}
                        className="flex flex-col overflow-hidden rounded-xl border border-solid border-black/8 bg-white shadow-sm transition hover:shadow-md dark:border-white/[.145] dark:bg-black"
                      >
                        <div className="p-6 flex-1">
                          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            <Icon className="h-6 w-6" />
                          </div>
                          <h4 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                            {example.title}
                          </h4>
                          {meta ? (
                            <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                              {meta}
                            </p>
                          ) : null}
                          <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                            {example.description}
                          </p>
                        </div>
                        <div className="px-6 pb-6">
                          <Link
                            href={`/${locale}${example.path}`}
                            className="inline-flex w-full items-center justify-center rounded-lg border border-solid border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/20"
                          >
                            {example.cta}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section id="benefits" className="py-8">
                <div className="rounded-2xl border border-solid border-black/8 bg-white p-8 dark:border-white/[.145] dark:bg-black">
                  <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                    <div>
                      <h3 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
                        {dict.homeBenefitsTitle}
                      </h3>
                      <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
                        {dict.homeBenefitsSubtitle}
                      </p>

                      <div className="mt-8 space-y-6">
                        {dict.homeBenefitsDetailed.map((benefit) => (
                          <div key={benefit.title} className="flex gap-4">
                            <div className="shrink-0">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                                <CheckCircle2 className="h-6 w-6" />
                              </div>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                                {benefit.title}
                              </h4>
                              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                                {benefit.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="rounded-xl bg-zinc-900 p-4 shadow-sm">
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
                          <div className="mb-6 flex items-center justify-between">
                            <div className="h-4 w-32 rounded bg-zinc-800" />
                            <div className="h-8 w-8 rounded-full bg-blue-600" />
                          </div>
                          <div className="space-y-4">
                            {[0, 1, 2].map((index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600/20">
                                    <div className="h-4 w-4 rounded bg-blue-300" />
                                  </div>
                                  <div className="h-3 w-28 rounded bg-zinc-700" />
                                </div>
                                <div className="h-2 w-16 rounded-full bg-zinc-700" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="get-started" className="rounded-2xl bg-foreground px-8 py-12 text-background">
                <div className="mx-auto max-w-2xl text-center">
                  <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {dict.homeFinalTitle}
                  </h3>
                  <p className="mt-4 text-base leading-7 opacity-90 sm:text-lg">
                    {dict.homeFinalSubtitle}
                  </p>

                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                      href={`/${locale}/register`}
                      className="inline-flex h-12 items-center justify-center rounded-lg bg-background px-8 text-base font-medium text-foreground transition-colors hover:opacity-90"
                    >
                      {dict.homeFinalCta}
                    </Link>
                    <Link
                      href={`/${locale}/login`}
                      className="inline-flex h-12 items-center justify-center rounded-lg bg-black/20 px-8 text-base font-medium text-background transition-colors hover:bg-black/30"
                    >
                      {dict.homeFinalSecondaryCta}
                    </Link>
                  </div>
                </div>
              </section>

              <footer className="border-t border-black/8 py-10 text-center text-sm text-zinc-500 dark:border-white/[.145] dark:text-zinc-400">
                {dict.homeFooterText}
              </footer>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
