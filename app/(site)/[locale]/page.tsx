import type { Metadata } from "next";
import { FinalCta, BoatCollectionSection, HomeHero, TransferSection, WaterToysSection } from "@/components/sections/HomeSections";
import { buildHomeAlternates } from "@/lib/content";
import { assertLocale, siteUrl, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  return {
    title: locale === "es" ? "Ibiza Lifestyle Management" : "Ibiza Lifestyle Management",
    description:
      locale === "es"
        ? "Barcos, transfers privados y juguetes náuticos coordinados por FastServices Ibiza."
        : "Boats, private transfers and water toys coordinated by FastServices Ibiza.",
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: buildHomeAlternates()
    }
  };
}

export default async function HomePage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale) as Locale;

  return (
    <main>
      <HomeHero locale={locale} />
      <BoatCollectionSection locale={locale} />
      <TransferSection locale={locale} />
      <WaterToysSection locale={locale} />
      <FinalCta locale={locale} />
    </main>
  );
}