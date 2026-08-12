import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/HomeSections";
import { HomeConversionSections } from "@/components/sections/HomeConversionSections";
import { buildHomeAlternates, getPublicContent } from "@/lib/content";
import { assertLocale, siteUrl, uiLabels, type Locale } from "@/lib/i18n";
import { resolveHomeSettings } from "@/lib/homeSettings";
import { loadPublicSiteSettings } from "@/lib/siteSettings";

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
	const [content, siteSettings] = await Promise.all([getPublicContent(), loadPublicSiteSettings()]);
	const homeSettings = resolveHomeSettings(siteSettings, content.boats, content.boatCollections);
	return (
		<main>
			<HomeHero locale={locale} settings={homeSettings.hero} />
			<HomeConversionSections boats={content.boats} collections={content.boatCollections} locale={locale} settings={homeSettings} />
		</main>
	);
}
