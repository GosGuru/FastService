import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/HomeSections";
import { buildHomeAlternates } from "@/lib/content";
import { assertLocale, siteUrl, uiLabels, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale: rawLocale } = await params;
	const locale = assertLocale(rawLocale);

	return {
		title:
			locale === "es"
				? "Ibiza Lifestyle Management"
				: "Ibiza Lifestyle Management",
		description: uiLabels[locale].homeMetadataDescription,
		alternates: {
			canonical: `${siteUrl}/${locale}`,
			languages: buildHomeAlternates(),
		},
	};
}

export default async function HomePage({ params }: Props) {
	const { locale: rawLocale } = await params;
	const locale = assertLocale(rawLocale) as Locale;
	return (
		<main>
			<HomeHero locale={locale} />
		</main>
	);
}
