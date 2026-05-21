import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoatGrid } from "@/components/boats/BoatGrid";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { getAllBoatPaths, getBoatBySlug, getBoatsByCollection } from "@/lib/content";
import { assertLocale, getLocalizedSlug, getLocalizedValue, siteUrl, type Locale } from "@/lib/i18n";
import { buildBoatAvailabilityMessage } from "@/lib/whatsapp";

type Props = { params: Promise<{ locale: string; categorySlug: string; boatSlug: string }> };

export const revalidate = 60;

export function generateStaticParams() {
  return getAllBoatPaths();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, categorySlug, boatSlug } = await params;
  const locale = assertLocale(rawLocale);
  const boat = await getBoatBySlug(locale, categorySlug, boatSlug);

  if (!boat) return {};

  return {
    title: getLocalizedValue(boat.seoTitle, locale),
    description: getLocalizedValue(boat.seoDescription, locale),
    alternates: {
      canonical: `${siteUrl}/${locale}/boat/${getLocalizedSlug(boat.categorySlugsByLocale, locale)}/${getLocalizedSlug(boat.slugsByLocale, locale)}`
    }
  };
}

export default async function BoatPage({ params }: Props) {
  const { locale: rawLocale, categorySlug, boatSlug } = await params;
  const locale = assertLocale(rawLocale) as Locale;
  const boat = await getBoatBySlug(locale, categorySlug, boatSlug);

  if (!boat) notFound();

  const related = (await getBoatsByCollection(boat.collectionId)).filter((item) => item.id !== boat.id).slice(0, 3);
  const availabilityMessage = buildBoatAvailabilityMessage(
    locale,
    boat.collectionId,
    boat.name,
    getLocalizedValue(boat.whatsappMessage, locale)
  );

  return (
    <main>
      <section className="detail-hero">
        <ImageCarousel assets={[boat.image, ...boat.gallery]} locale={locale} href={`/${locale}/boat/${categorySlug}/${boatSlug}`} ariaLabel={boat.name} className="detail-hero__image" sizes="(max-width: 900px) 100vw, 50vw" priority />
        <div className="detail-hero__content">
          <p className="eyebrow">{boat.collectionId === "fast-boats" ? "Embarcación rápida" : "Alquiler de barcos"}</p>
          <h1>{boat.name}</h1>
          {boat.priceLabel ? <p className="detail-price">{getLocalizedValue(boat.priceLabel, locale)}</p> : null}
          <div className="detail-specs">
            {boat.specs.map((spec) => (
              <span key={spec.label.es}>{getLocalizedValue(spec.value, locale)} {getLocalizedValue(spec.label, locale)}</span>
            ))}
          </div>
          <WhatsAppCta locale={locale} message={availabilityMessage} />
        </div>
      </section>
      <section className="section section--soft">
        <div className="container narrow-copy">
          <h2>{locale === "es" ? "Consulta disponibilidad real" : "Check real availability"}</h2>
          <p>{locale === "es" ? "Confirmamos disponibilidad, ruta, patrón y condiciones directamente por WhatsApp para cerrar la experiencia con precisión." : "We confirm availability, route, skipper and terms directly by WhatsApp to close the experience precisely."}</p>
        </div>
      </section>
      {related.length ? (
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">{locale === "es" ? "También puede encajar" : "You may also like"}</p>
              <h2>{locale === "es" ? "Opciones relacionadas" : "Related options"}</h2>
            </div>
            <BoatGrid boats={related} locale={locale} />
          </div>
        </section>
      ) : null}
    </main>
  );
}