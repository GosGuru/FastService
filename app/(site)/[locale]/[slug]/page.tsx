import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoatGrid } from "@/components/boats/BoatGrid";
import { BoatCtaBanner } from "@/components/sections/BoatCtaBanner";
import { ContactFormSection } from "@/components/sections/ContactFormSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { DetailGallery } from "@/components/media/DetailGallery";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import { MediaImage } from "@/components/MediaImage";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { ServiceOptionCard } from "@/components/services/ServiceOptionCard";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { WaterToyCard } from "@/components/water-toys/WaterToyCard";
import { faqs as fallbackFaqs } from "@/data/faqs";
import { buildAlternates, getAllLocalizedStaticPaths, getPageBySlug, getPublicContent } from "@/lib/content";
import { assertLocale, getLocalizedSlug, getLocalizedValue, siteUrl, type Locale } from "@/lib/i18n";
import type { ServiceOption, ServicePage } from "@/types/content";

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

const serviceDetailCopy: Record<string, Record<string, string>> = {
  book: { es: "Reservar", en: "Book Now", de: "Jetzt buchen", nl: "Nu boeken" },
  description: { es: "Descripción", en: "Description", de: "Beschreibung", nl: "Omschrijving" },
  equipment: { es: "Equipamiento", en: "Equipment", de: "Ausstattung", nl: "Uitrusting" },
  gallery: { es: "Galería", en: "Gallery", de: "Galerie", nl: "Galerij" }
};

function t(key: string, locale: Locale) {
  return serviceDetailCopy[key]?.[locale] ?? serviceDetailCopy[key]?.es ?? key;
}

function getAmenityLabel(item: string | Record<string, string>, locale: Locale) {
  return typeof item === "string" ? item : getLocalizedValue(item, locale);
}

function keepWordsTogether(text: string) {
  return text.trim().replace(/\s+/g, "\u00a0");
}

function getBoatCollectionHeroTitle(locale: Locale, collectionTitle: string) {
  if (locale === "es") return `Explora Nuestra Colección\u00a0de ${collectionTitle}`;

  return `Explore our ${collectionTitle}\u00a0collection`;
}

export default async function DynamicPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale) as Locale;
  const page = await getPageBySlug(locale, slug);

  if (!page) notFound();

  if (page.kind === "boatCollection") {
    const content = await getPublicContent();
    const collectionBoats = content.boats.filter((boat) => boat.collectionId === page.collectionId);
    const snapshotBoatFaqs = (content.faqs ?? []).filter((faq) => faq.serviceId === "boats");
    const fallbackBoatFaqs = fallbackFaqs.filter((faq) => faq.serviceId === "boats");
    const boatFaqs = snapshotBoatFaqs.length >= 4 ? snapshotBoatFaqs : fallbackBoatFaqs;
    const collectionTitle = keepWordsTogether(getLocalizedValue(page.title, locale));

    return (
      <main>
        <section className="page-hero page-hero--compact page-hero--boat-collection">
          <div className="page-hero__media">
            <MediaImage asset={page.image} locale={locale} sizes="100vw" priority />
          </div>
          <div className="page-hero__overlay" />
          <div className="container page-hero__content">
            <p className="eyebrow">{getLocalizedValue(page.eyebrow, locale)}</p>
            <h1>{getBoatCollectionHeroTitle(locale, collectionTitle)}</h1>
            <p>{getLocalizedValue(page.description, locale)}</p>
            <WhatsAppCta locale={locale} message={getLocalizedValue(page.whatsappMessage, locale)} variant="light" />
          </div>
        </section>
        <section className="section boat-grid-section">
          <div className="container">
            <div className="boat-grid-section__intro">
              <h2>{collectionTitle}</h2>
            </div>
            <BoatGrid boats={collectionBoats} locale={locale} />
          </div>
        </section>
        <BoatCtaBanner collection={page} locale={locale} />
        <FaqSection items={boatFaqs} locale={locale} />
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
        <ServiceDetails page={page} locale={locale} />
        <section className="section section--soft">
          <div className="container">
            <div className="section-heading section-heading--center">
              <p className="eyebrow">{locale === "es" ? "Descubre nuestra flota" : "Discover our fleet"}</p>
              <h2>{locale === "es" ? "Vehículos con chófer para cada momento" : "Chauffeur vehicles for every moment"}</h2>
            </div>
            <div className="content-grid content-grid--three catalog-grid">
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
        <ServiceDetails page={page} locale={locale} />
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">{locale === "es" ? "Sin precios publicados" : "No published prices"}</p>
              <h2>{locale === "es" ? "Consulta disponibilidad por WhatsApp" : "Check availability by WhatsApp"}</h2>
              <p>{locale === "es" ? "Cada juguete depende de logística, fecha, barco y condiciones. Te lo confirmamos directamente por WhatsApp." : "Each toy depends on logistics, date, boat and conditions. We confirm it directly by WhatsApp."}</p>
            </div>
            <div className="content-grid content-grid--three catalog-grid">
              {content.waterToys.map((toy) => (
                <WaterToyCard toy={toy} locale={locale} sectionSlug={sectionSlug} key={toy.id} />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (page.serviceId === "security") {
    return (
      <main>
        <ServiceHero page={page} locale={locale} />
        <ServiceOptionsGrid
          locale={locale}
          options={page.options ?? []}
          eyebrow={locale === "es" ? "Tres coberturas principales" : "Three core coverages"}
          title={locale === "es" ? "Protección privada según el plan" : "Private protection matched to the plan"}
          description={
            locale === "es"
              ? "Trabajamos cada servicio según agenda, ubicación y nivel de discreción requerido."
              : "Each service is coordinated around the schedule, location and required level of discretion."
          }
          soft
        />
      </main>
    );
  }

  if (page.serviceId === "self-drive") {
    return (
      <main>
        <ServiceHero page={page} locale={locale} />
        <ServiceOptionsGrid
          locale={locale}
          options={page.options ?? []}
          eyebrow={locale === "es" ? "Sin precios publicados" : "No published prices"}
          title={locale === "es" ? "Consulta disponibilidad por WhatsApp" : "Check availability by WhatsApp"}
          description={
            locale === "es"
              ? "Los modelos se confirman según fecha, punto de entrega, condiciones y disponibilidad real."
              : "Models are confirmed according to date, delivery point, terms and real availability."
          }
        />
      </main>
    );
  }

  return (
    <main>
      <ServiceHero page={page} locale={locale} />
      <ServiceDetails page={page} locale={locale} />
      <ContactFormSection locale={locale} />
    </main>
  );
}

function ServiceOptionsGrid({
  locale,
  options,
  eyebrow,
  title,
  description,
  soft = false
}: {
  locale: Locale;
  options: ServiceOption[];
  eyebrow: string;
  title: string;
  description: string;
  soft?: boolean;
}) {
  if (!options.length) return null;

  return (
    <section className={`section ${soft ? "section--soft" : ""}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="content-grid content-grid--three catalog-grid">
          {options.map((option) => (
            <ServiceOptionCard option={option} locale={locale} key={option.id} />
          ))}
        </div>
      </div>
    </section>
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

function ServiceDetails({ page, locale }: { page: ServicePage; locale: Locale }) {
  const richDescription = page.richDescription?.[locale] ?? page.richDescription?.es;
  const specs = page.specs ?? [];
  const priceText = page.priceLabel ? getLocalizedValue(page.priceLabel, locale).trim() : "";
  const marina = page.marina ? getLocalizedValue(page.marina, locale) : "";
  const amenities = (page.amenities ?? []).flatMap((amenity) => {
    const label = getAmenityLabel(amenity, locale);

    return label ? [label] : [];
  });
  const galleryImages = [page.image, ...(page.gallery ?? [])];
  const title = getLocalizedValue(page.title, locale);
  const hasMainDetails = Boolean(richDescription?.html || specs.length > 0 || priceText);

  return (
    <>
      {(richDescription?.html || specs.length > 0 || amenities.length > 0 || marina || priceText) ? (
        <section className="boat-detail-info">
          <div className="container boat-detail-info__grid">
            {hasMainDetails ? (
              <article className="boat-detail-description">
                <h2>{t("description", locale)}</h2>
                {priceText ? <p className="boat-detail-hero__price">{priceText}</p> : null}
                {specs.length > 0 ? (
                  <div className="boat-detail-hero__specs">
                    {specs.map((spec) => (
                      <span key={spec.label.es}>
                        <strong>{getLocalizedValue(spec.value, locale)}</strong>{" "}
                        {getLocalizedValue(spec.label, locale)}
                      </span>
                    ))}
                  </div>
                ) : null}
                {richDescription?.html ? <div className="rich-content" dangerouslySetInnerHTML={{ __html: richDescription.html }} /> : null}
              </article>
            ) : null}

            <aside className="boat-detail-side" aria-label={`${title} ${t("equipment", locale)}`}>
              {amenities.length > 0 ? (
                <div className="boat-detail-side__group">
                  <div className="boat-detail-side__title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M9.153 5.408C10.42 3.136 11.053 2 12 2s1.58 1.136 2.847 3.408l.328.588c.36.646.54.969.82 1.182s.63.292 1.33.45l.636.144c2.46.557 3.689.835 3.982 1.776.292.94-.546 1.921-2.223 3.882l-.434.507c-.476.557-.715.836-.822 1.18-.107.345-.071.717.001 1.46l.066.677c.253 2.617.38 3.925-.386 4.506s-1.918.051-4.22-1.009l-.597-.274c-.654-.302-.981-.452-1.328-.452s-.674.15-1.328.452l-.596.274c-2.303 1.06-3.455 1.59-4.22 1.01-.767-.582-.64-1.89-.387-4.507l.066-.676c.072-.744.108-1.116 0-1.46-.106-.345-.345-.624-.821-1.18l-.434-.508c-1.677-1.96-2.515-2.941-2.223-3.882S3.58 8.328 6.04 7.772l.636-.144c.699-.158 1.048-.237 1.329-.45s.46-.536.82-1.182z" />
                    </svg>
                    <h2>{t("equipment", locale)}</h2>
                  </div>
                  <ul className="boat-detail-equipment">
                    {amenities.map((amenity, index) => (
                      <li key={`${amenity}-${index}`}>{amenity}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {marina ? (
                <div className="boat-detail-marina">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" aria-hidden="true">
                    <path d="M14.5 5.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0M12 8v13m-7-8l-2-1a9 9 0 1 0 18 0l-2 1" />
                  </svg>
                  <strong>{marina}</strong>
                </div>
              ) : null}

              <div className="boat-detail-reserve">
                <WhatsAppCta locale={locale} message={getLocalizedValue(page.whatsappMessage, locale)} label={`${t("book", locale)} ${title}`} />
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      {galleryImages.length > 1 ? (
        <DetailGallery assets={galleryImages} locale={locale} title={t("gallery", locale)} />
      ) : null}
    </>
  );
}
