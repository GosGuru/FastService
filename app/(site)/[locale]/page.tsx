import type { Metadata } from "next";
import {
	BoatCollectionSection,
	FeaturedBoatsSection,
	HomeHero,
	HomeIntroSection,
	SecuritySection,
	SelfDriveVehiclesSection,
	TransferSection,
	WaterToysSection,
} from "@/components/sections/HomeSections";
import { ContactFormSection } from "@/components/sections/ContactFormSection";
import { buildHomeAlternates, getPublicContent } from "@/lib/content";
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
	const content = await getPublicContent();

	return (
		<main>
			<HomeHero locale={locale} />
			{/*
      <HomeIntroSection locale={locale} />
      <BoatCollectionSection collections={content.boatCollections} locale={locale} />
      <FeaturedBoatsSection boats={content.boats} locale={locale} />
      <TransferSection servicePages={content.servicePages} vehicles={content.vehicles} locale={locale} />
      <WaterToysSection servicePages={content.servicePages} waterToys={content.waterToys} locale={locale} />
      <SecuritySection servicePages={content.servicePages} locale={locale} />
      <SelfDriveVehiclesSection servicePages={content.servicePages} locale={locale} />
      <ContactFormSection locale={locale} />
      */}
		</main>
	);
}
