import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { buildAlternates, getAllLocalizedItemPaths, getItemBySectionAndSlug, getServicePageBySlug } from "@/lib/content";
import { assertLocale, getLocalizedSlug, getLocalizedValue, siteUrl, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string; itemSlug: string }> };

export const revalidate = 60;

export function generateStaticParams() {
  return getAllLocalizedItemPaths();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug, itemSlug } = await params;
  const locale = assertLocale(rawLocale);
  const item = await getItemBySectionAndSlug(locale, slug, itemSlug);

  if (!item) return {};

  const section = await getServicePageBySlug(locale, slug);

  if (!section) return {};

  return {
    title: getLocalizedValue(item.seoTitle, locale),
    description: getLocalizedValue(item.seoDescription, locale),
    alternates: {
      canonical: `${siteUrl}/${locale}/${getLocalizedSlug(section.slugsByLocale, locale)}/${getLocalizedSlug(item.slugsByLocale, locale)}`,
      languages: buildAlternates(section.slugsByLocale, `/${getLocalizedSlug(item.slugsByLocale, locale)}`)
    }
  };
}

export default async function ItemPage({ params }: Props) {
  const { locale: rawLocale, slug, itemSlug } = await params;
  const locale = assertLocale(rawLocale) as Locale;
  const item = await getItemBySectionAndSlug(locale, slug, itemSlug);

  if (!item) notFound();

  return (
    <main>
      <section className="detail-hero">
        <ImageCarousel assets={[item.image, ...item.gallery]} locale={locale} href={`/${locale}/${slug}/${itemSlug}`} ariaLabel={item.kind === "vehicle" ? item.name : getLocalizedValue(item.name, locale)} className="detail-hero__image" sizes="(max-width: 900px) 100vw, 50vw" priority />
        <div className="detail-hero__content">
          <p className="eyebrow">{item.kind === "vehicle" ? (locale === "es" ? "Transfer privado" : "Private transfer") : (locale === "es" ? "Juguete náutico" : "Water toy")}</p>
          <h1>{item.kind === "vehicle" ? item.name : getLocalizedValue(item.name, locale)}</h1>
          <p>{item.kind === "vehicle" ? getLocalizedValue(item.overview, locale) : getLocalizedValue(item.details, locale)}</p>
          <WhatsAppCta locale={locale} message={getLocalizedValue(item.whatsappMessage, locale)} />
        </div>
      </section>
      {item.kind === "vehicle" ? (
        <section className="section section--soft">
          <div className="container detail-columns">
            <div>
              <h2>{locale === "es" ? "Car overview" : "Car overview"}</h2>
              <p>{getLocalizedValue(item.overview, locale)}</p>
            </div>
            <div>
              <h2>{locale === "es" ? "Servicios con este vehículo" : "Services with this vehicle"}</h2>
              <ul className="check-list">
                {item.services.map((service) => (
                  <li key={service.es}>{getLocalizedValue(service, locale)}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <section className="section section--soft">
          <div className="container narrow-copy">
            <h2>{locale === "es" ? "Disponibilidad personalizada" : "Tailored availability"}</h2>
            <p>{locale === "es" ? "No publicamos precios para juguetes náuticos. Escríbenos y te confirmamos opciones reales según fecha, barco y logística." : "We do not publish water toy prices. Message us and we will confirm real options based on date, boat and logistics."}</p>
          </div>
        </section>
      )}
    </main>
  );
}