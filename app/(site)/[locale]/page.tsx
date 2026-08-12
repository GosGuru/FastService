import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/HomeSections";
import { HomeConversionSections } from "@/components/sections/HomeConversionSections";
import { buildHomeAlternates, getPublicContent } from "@/lib/content";
import { assertLocale, siteUrl, uiLabels, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale: rawLocale } = await params;
	const locale = assertLocale(rawLocale);

	return {
		title: locale === "es" ? "Alquiler de barcos en Ibiza y Formentera" : "Boat rental in Ibiza and Formentera",
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
	const content = await getPublicContent();
	return (
		<main>
			<HomeHero locale={locale} />
			<HomeConversionSections boats={content.boats} collections={content.boatCollections} locale={locale} />
		</main>
	);
}
