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
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ page?: string }>;
}) {
	const session = await getServerSession(authOptions);
	const { locale: localeParam } = await params;
	const { page: pageParam } = await searchParams;

	if (!isLocale(localeParam)) {
		notFound();
	}

	const locale = localeParam as Locale;

	if (!session || !session.user?.email) {
		redirect(`/${locale}/login?callbackUrl=/${locale}/2000-palavras`);
	}

	const dict = getDictionary(locale);

	const allWords = await getMostCommonEnglishWords2000();

	// Configurações de paginação
	const ITEMS_PER_PAGE = 10;
	const totalItems = allWords.length;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	// Determina a página atual validando limites
	const currentPage = Math.max(
		1,
		Math.min(totalPages, parseInt(pageParam || "1", 10) || 1)
	);

	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const rows = allWords.slice(startIndex, endIndex);

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
				showing: "Mostrando",
				of: "de",
				words: "palavras",
			}
			: locale === "es"
				? {
					title: "2000 palabras más comunes (inglés)",
					colWord: "Palabra (EN)",
					colTranslation: "Traducción (PT-BR)",
					colExampleEn: "Frase (EN)",
					colExamplePt: "Traducción (PT-BR)",
					colContext: "Contexto",
					showing: "Mostrando",
					of: "de",
					words: "palabras",
				}
				: {
					title: "2000 most common words (English)",
					colWord: "Word (EN)",
					colTranslation: "Translation (PT-BR)",
					colExampleEn: "Example (EN)",
					colExamplePt: "Translation (PT-BR)",
					colContext: "Context",
					showing: "Showing",
					of: "of",
					words: "words",
				};

	// Lógica para gerar os números de páginas visíveis
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (currentPage > 3) {
				pages.push("...");
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("...");
			}

			pages.push(totalPages);
		}
		return pages;
	};

	const pageNumbers = getPageNumbers();

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
								<th className="px-4 py-3 w-16 text-center">#</th>
								<th className="px-4 py-3">{labels.colWord}</th>
								<th className="px-4 py-3">{labels.colTranslation}</th>
								<th className="px-4 py-3">{labels.colExampleEn}</th>
								<th className="px-4 py-3">{labels.colExamplePt}</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row, idx) => (
								<tr key={row.word} className="border-b border-black/8 last:border-0 dark:border-white/[.145]">
									<td className="px-4 py-3 font-semibold text-zinc-400 dark:text-zinc-500 text-center">
										{startIndex + idx + 1}
									</td>
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
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Controles de Paginação */}
				<div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
					<div className="text-sm text-zinc-600 dark:text-zinc-400">
						{labels.showing} <span className="font-semibold text-zinc-900 dark:text-zinc-100">{startIndex + 1}</span> a{" "}
						<span className="font-semibold text-zinc-900 dark:text-zinc-100">{Math.min(endIndex, totalItems)}</span> {labels.of}{" "}
						<span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItems}</span> {labels.words}
					</div>

					<nav className="flex items-center gap-1" aria-label="Paginação">
						{/* Botão Anterior */}
						<Link
							href={`/${locale}/2000-palavras?page=${currentPage - 1}`}
							className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-solid border-black/8 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 ${currentPage === 1 ? "pointer-events-none opacity-40" : ""
								}`}
							title="Página Anterior"
						>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</Link>

						{/* Números das Páginas */}
						{pageNumbers.map((p, idx) => {
							if (p === "...") {
								return (
									<span
										key={`dots-${idx}`}
										className="inline-flex h-9 w-9 items-center justify-center text-zinc-400 dark:text-zinc-600"
									>
										...
									</span>
								);
							}

							const isCurrent = p === currentPage;
							return (
								<Link
									key={p}
									href={`/${locale}/2000-palavras?page=${p}`}
									className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${isCurrent
										? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500"
										: "border border-solid border-black/8 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
										}`}
								>
									{p}
								</Link>
							);
						})}

						{/* Botão Próximo */}
						<Link
							href={`/${locale}/2000-palavras?page=${currentPage + 1}`}
							className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-solid border-black/8 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 ${currentPage === totalPages ? "pointer-events-none opacity-40" : ""
								}`}
							title="Próxima Página"
						>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</Link>
					</nav>
				</div>
			</div>
		</div>
	);
}
