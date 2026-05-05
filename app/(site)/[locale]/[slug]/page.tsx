import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoatGrid } from "@/components/boats/BoatGrid";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import { MediaImage } from "@/components/MediaImage";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { WaterToyCard } from "@/components/water-toys/WaterToyCard";
import { buildAlternates, getAllLocalizedStaticPaths, getBoatsByCollection, getPageBySlug, getPublicContent } from "@/lib/content";
import { assertLocale, getLocalizedSlug, getLocalizedValue, siteUrl, type Locale } from "@/lib/i18n";
import type { ServicePage } from "@/types/content";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 60;

export function generateStaticParams() {
  return getAllLocalizedStaticPaths();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  const page = await getPageBySlug(locale, slug);

  if (!page) return {};

  return {
    title: getLocalizedValue(page.seoTitle, locale),
    description: getLocalizedValue(page.seoDescription, locale),
    alternates: {
      canonical: `${siteUrl}/${locale}/${getLocalizedSlug(page.slugsByLocale, locale)}`,
      languages: buildAlternates(page.slugsByLocale)
    }
  };
}

export default async function DynamicPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale) as Locale;
  const page = await getPageBySlug(locale, slug);

  if (!page) notFound();

  if (page.kind === "boatCollection") {
    const collectionBoats = await getBoatsByCollection(page.collectionId);

    return (
      <main>
        <section className="page-hero page-hero--compact">
          <div className="page-hero__media">
            <MediaImage asset={page.image} locale={locale} sizes="100vw" priority />
          </div>
          <div className="page-hero__overlay" />
          <div className="container page-hero__content">
            <p className="eyebrow">{getLocalizedValue(page.eyebrow, locale)}</p>
            <h1>{locale === "es" ? `Explora Nuestra Colección de ${getLocalizedValue(page.title, locale)}` : `Explore our ${getLocalizedValue(page.title, locale)} collection`}</h1>
            <p>{getLocalizedValue(page.description, locale)}</p>
            <WhatsAppCta locale={locale} message={getLocalizedValue(page.whatsappMessage, locale)} variant="light" />
          </div>
        </section>
        <section className="section">
          <div className="container">
            <BoatGrid boats={collectionBoats} locale={locale} />
          </div>
        </section>
      </main>
    );
  }

  if (page.kind === "seoPage") {
    const currentSlug = getLocalizedSlug(page.slugsByLocale, locale);
    const richContent = page.body[locale] ?? page.body.es;

    return (
      <main>
        <section className="page-hero page-hero--compact">
          <div className="page-hero__media">
            <MediaImage asset={page.image} locale={locale} sizes="100vw" priority />
          </div>
          <div className="page-hero__overlay" />
          <div className="container page-hero__content">
            <p className="eyebrow">{getLocalizedValue(page.eyebrow, locale)}</p>
            <h1>{getLocalizedValue(page.title, locale)}</h1>
            <p>{getLocalizedValue(page.excerpt, locale)}</p>
            <WhatsAppCta locale={locale} variant="light" />
          </div>
        </section>
        <article className="section">
          <div className="container seo-page-layout">
            <div className="narrow-copy seo-page-body" dangerouslySetInnerHTML={{ __html: richContent.html }} />
            {page.gallery.length ? (
              <ImageCarousel assets={[page.image, ...page.gallery]} locale={locale} href={`/${locale}/${currentSlug}`} ariaLabel={getLocalizedValue(page.title, locale)} className="seo-page-gallery" sizes="(max-width: 900px) 100vw, 42vw" />
            ) : null}
          </div>
        </article>
      </main>
    );
  }

  const content = await getPublicContent();
  const sectionSlug = getLocalizedSlug(page.slugsByLocale, locale);

  if (page.serviceId === "transfers") {
    return (
      <main>
        <ServiceHero page={page} locale={locale} />
        <section className="section section--soft">
          <div className="container">
            <div className="section-heading section-heading--center">
              <p className="eyebrow">{locale === "es" ? "Descubre nuestra flota" : "Discover our fleet"}</p>
              <h2>{locale === "es" ? "Vehículos con chófer para cada momento" : "Chauffeur vehicles for every moment"}</h2>
            </div>
            <div className="content-grid content-grid--three">
              {content.vehicles.map((vehicle) => (
                <VehicleCard vehicle={vehicle} locale={locale} sectionSlug={sectionSlug} key={vehicle.id} />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (page.serviceId === "water-toys") {
    return (
      <main>
        <ServiceHero page={page} locale={locale} />
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">{locale === "es" ? "Sin precios publicados" : "No published prices"}</p>
              <h2>{locale === "es" ? "Consulta disponibilidad por WhatsApp" : "Check availability by WhatsApp"}</h2>
              <p>{locale === "es" ? "Cada juguete depende de logística, fecha, barco y condiciones. Te lo confirmamos directamente por WhatsApp." : "Each toy depends on logistics, date, boat and conditions. We confirm it directly by WhatsApp."}</p>
            </div>
            <div className="content-grid content-grid--three">
              {content.waterToys.map((toy) => (
                <WaterToyCard toy={toy} locale={locale} sectionSlug={sectionSlug} key={toy.id} />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <ServiceHero page={page} locale={locale} />
      <section className="section">
        <div className="container contact-panel">
          <div>
            <h2>{locale === "es" ? "Escríbenos por WhatsApp" : "Message us on WhatsApp"}</h2>
            <p>{getLocalizedValue(page.description, locale)}</p>
            <WhatsAppCta locale={locale} message={getLocalizedValue(page.whatsappMessage, locale)} />
          </div>
          <div className="contact-panel__links">
            <Link href="tel:+34671338141">+34 671 338 141</Link>
            <Link href="mailto:info@fastservices.example">info@fastservices.example</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ServiceHero({ page, locale }: { page: ServicePage; locale: Locale }) {
  return (
    <section className="page-hero">
      <div className="page-hero__media">
        <MediaImage asset={page.image} locale={locale} sizes="100vw" priority />
      </div>
      <div className="page-hero__overlay" />
      <div className="container page-hero__content">
        <p className="eyebrow">{getLocalizedValue(page.eyebrow, locale)}</p>
        <h1>{getLocalizedValue(page.title, locale)}</h1>
        <p>{getLocalizedValue(page.description, locale)}</p>
        <WhatsAppCta locale={locale} message={getLocalizedValue(page.whatsappMessage, locale)} variant="light" />
      </div>
    </section>
  );
}