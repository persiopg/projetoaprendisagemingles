import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { getMostCommonEnglishWords2000 } from "@/data/mostCommonEnglishWords2000";
import { getDictionary } from "@/i18n/getDictionary";
import { isLocale, type Locale } from "@/i18n/locales";

export const dynamic = "force-dynamic";

export default async function Words2000Page({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const session = await getServerSession(authOptions);
	const { locale: localeParam } = await params;

	if (!isLocale(localeParam)) {
		notFound();
	}

	const locale = localeParam as Locale;

	if (!session || !session.user?.email) {
		redirect(`/${locale}/login?callbackUrl=/${locale}/2000-palavras`);
	}

	const dict = getDictionary(locale);

	const rows = await getMostCommonEnglishWords2000();

	const renderExamples = (examples: string[] | null) => {
		if (!examples || examples.length === 0) return "—";
		return (
			<div className="space-y-1">
				{examples.slice(0, 3).map((t, idx) => (
					<div key={idx}>{t}</div>
				))}
			</div>
		);
	};

	const labels =
		locale === "pt-br"
			? {
					title: "2000 palavras mais comuns (inglês)",
					colWord: "Palavra (EN)",
					colTranslation: "Tradução (PT-BR)",
					colExampleEn: "Frase (EN)",
					colExamplePt: "Tradução (PT-BR)",
					colContext: "Contexto",
				}
			: locale === "es"
				? {
						title: "2000 palabras más comunes (inglés)",
						colWord: "Palabra (EN)",
						colTranslation: "Traducción (PT-BR)",
						colExampleEn: "Frase (EN)",
						colExamplePt: "Traducción (PT-BR)",
						colContext: "Contexto",
					}
				: {
						title: "2000 most common words (English)",
						colWord: "Word (EN)",
						colTranslation: "Translation (PT-BR)",
						colExampleEn: "Example (EN)",
						colExamplePt: "Translation (PT-BR)",
						colContext: "Context",
					};

	return (
		<div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
			<div className="container mx-auto px-4 py-10 sm:py-12">
				<header className="flex flex-col gap-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
							{labels.title}
						</h1>
						<Link
							href={`/${locale}/2000-palavras/flashcards`}
							className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
						>
							Praticar com Flashcards
						</Link>
					</div>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">{dict.mvpNote}</p>
				</header>

				<div className="mt-8 overflow-x-auto rounded-2xl border border-solid border-black/8 bg-white dark:border-white/[.145] dark:bg-black">
					<table className="min-w-245 w-full text-left text-sm">
						<thead className="border-b border-black/8 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-400">
							<tr>
								<th className="px-4 py-3">{labels.colWord}</th>
								<th className="px-4 py-3">{labels.colTranslation}</th>
								<th className="px-4 py-3">{labels.colExampleEn}</th>
								<th className="px-4 py-3">{labels.colExamplePt}</th>
								<th className="px-4 py-3">{labels.colContext}</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.word} className="border-b border-black/8 last:border-0 dark:border-white/[.145]">
									<td className="px-4 py-3 font-medium text-zinc-950 dark:text-zinc-50">
										{row.word}
									</td>
									<td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
										{row.translationPtBr ?? "—"}
									</td>
									<td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
										{renderExamples(row.exampleEn)}
									</td>
									<td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
										{renderExamples(row.examplePtBr)}
									</td>
									<td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
										{/* Context column */}
										{row.context ?? "—"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
