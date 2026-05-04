import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoatGrid } from "@/components/boats/BoatGrid";
import { MediaImage } from "@/components/MediaImage";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { getAllBoatPaths, getBoatBySlug, getBoatsByCollection } from "@/lib/content";
import { assertLocale, getLocalizedSlug, getLocalizedValue, siteUrl, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; categorySlug: string; boatSlug: string }> };

export function generateStaticParams() {
  return getAllBoatPaths();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, categorySlug, boatSlug } = await params;
  const locale = assertLocale(rawLocale);
  const boat = getBoatBySlug(locale, categorySlug, boatSlug);

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
  const boat = getBoatBySlug(locale, categorySlug, boatSlug);

  if (!boat) notFound();

  const related = getBoatsByCollection(boat.collectionId).filter((item) => item.id !== boat.id).slice(0, 3);

  return (
    <main>
      <section className="detail-hero">
        <div className="detail-hero__image">
          <MediaImage asset={boat.image} locale={locale} sizes="(max-width: 900px) 100vw, 50vw" priority />
        </div>
        <div className="detail-hero__content">
          <p className="eyebrow">{boat.collectionId === "fast-boats" ? "Embarcación rápida" : "Alquiler de barcos"}</p>
          <h1>{boat.name}</h1>
          {boat.priceLabel ? <p className="detail-price">{getLocalizedValue(boat.priceLabel, locale)}</p> : null}
          <div className="detail-specs">
            {boat.specs.map((spec) => (
              <span key={spec.label.es}>{getLocalizedValue(spec.value, locale)} {getLocalizedValue(spec.label, locale)}</span>
            ))}
          </div>
          <WhatsAppCta locale={locale} message={getLocalizedValue(boat.whatsappMessage, locale)} />
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