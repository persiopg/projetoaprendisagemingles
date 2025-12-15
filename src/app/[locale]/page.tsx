import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import type { RowDataPacket } from "mysql2";

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
              <section className="rounded-2xl border border-solid border-black/8 bg-white p-8 dark:border-white/[.145] dark:bg-black">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
                      {dict.homeHeroTitle}
                    </h2>
                    <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                      {dict.homeHeroSubtitle}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:items-end">
                    <Link
                      href={`/${locale}/register`}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-black/80 dark:hover:bg-white/80"
                    >
                      {dict.homeHeroPrimaryCta}
                    </Link>
                    <Link
                      href={`/${locale}/login`}
                      className="text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      {dict.homeHeroSecondaryCta}
                    </Link>
                  </div>
                </div>
              </section>

              <section id="examples" className="flex flex-col gap-5">
                <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
                  {dict.homeExamplesTitle}
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {dict.homeExamples.map((example) => (
                    <li
                      key={example.path}
                      className="rounded-2xl border border-solid border-black/8 bg-white p-6 dark:border-white/[.145] dark:bg-black"
                    >
                      <h4 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                        {example.title}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {example.description}
                      </p>
                      <div className="mt-4">
                        <Link
                          href={`/${locale}${example.path}`}
                          className="inline-flex h-10 items-center justify-center rounded-full border border-solid border-black/8 px-4 text-sm font-medium text-zinc-950 hover:bg-black/4 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/8"
                        >
                          {example.cta}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="benefits" className="flex flex-col gap-5">
            <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {dict.homeBenefitsTitle}
            </h3>
            <ul className="grid gap-3">
              {dict.homeBenefits.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-solid border-black/8 bg-white px-5 py-4 text-zinc-600 dark:border-white/[.145] dark:bg-black dark:text-zinc-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section
            id="get-started"
            className="rounded-2xl border border-solid border-black/8 bg-white p-8 dark:border-white/[.145] dark:bg-black"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
                  {dict.homeFinalTitle}
                </h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {dict.homeFinalSubtitle}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={`/${locale}/register`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-black/80 dark:hover:bg-white/80"
                >
                  {dict.homeFinalCta}
                </Link>
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-solid border-black/8 px-6 text-sm font-medium text-zinc-950 hover:bg-black/4 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/8"
                >
                  {dict.homeFinalSecondaryCta}
                </Link>
              </div>
            </div>
          </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
