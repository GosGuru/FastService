import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoatGrid } from "@/components/boats/BoatGrid";
import { DetailGallery } from "@/components/media/DetailGallery";
import { MediaImage } from "@/components/MediaImage";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { FaqSection } from "@/components/sections/FaqSection";
import { ContactFormSection } from "@/components/sections/ContactFormSection";
import { getAllBoatPaths, getBoatBySlug, getBoatsByCollection, getPublicContent } from "@/lib/content";
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

const collectionLabels: Record<string, Record<string, string>> = {
  "yachts-xl": { es: "Yates XL", en: "XL Yachts", de: "XL Yachten", nl: "XL Jachten" },
  yachts: { es: "Yates", en: "Yachts", de: "Yachten", nl: "Jachten" },
  "fast-boats": { es: "Embarcaciones rápidas", en: "Fast Boats", de: "Schnellboote", nl: "Snelle boten" }
};

const uiCopy: Record<string, Record<string, string>> = {
  book: { es: "Reservar", en: "Book Now", de: "Jetzt buchen", nl: "Nu boeken" },
  description: { es: "Descripción", en: "Description", de: "Beschreibung", nl: "Omschrijving" },
  equipment: { es: "Equipamiento", en: "Equipment", de: "Ausstattung", nl: "Uitrusting" },
  gallery: { es: "Galería", en: "Gallery", de: "Galerie", nl: "Galerij" },
  video: { es: "Video", en: "Video", de: "Video", nl: "Video" },
  relatedPrefix: { es: "Otros", en: "Other", de: "Weitere", nl: "Andere" },
  relatedSuffix: { es: "en alquiler", en: "for charter", de: "zum Mieten", nl: "te huur" },
  home: { es: "Inicio", en: "Home", de: "Startseite", nl: "Home" }
};

function getAmenityLabel(item: string | Record<string, string>, locale: Locale) {
  return typeof item === "string" ? item : getLocalizedValue(item, locale);
}

export default async function BoatPage({ params }: Props) {
  const { locale: rawLocale, categorySlug, boatSlug } = await params;
  const locale = assertLocale(rawLocale) as Locale;
  const boat = await getBoatBySlug(locale, categorySlug, boatSlug);

  if (!boat) notFound();

  const content = await getPublicContent();
  const related = (await getBoatsByCollection(boat.collectionId)).filter((item) => item.id !== boat.id).slice(0, 3);
  const boatFaqs = content.faqs.filter((faq) => faq.serviceId === "boats");
  const availabilityMessage = buildBoatAvailabilityMessage(
    locale,
    boat.collectionId,
    boat.name,
    getLocalizedValue(boat.whatsappMessage, locale)
  );

  const collectionLabel = collectionLabels[boat.collectionId]?.[locale] ?? collectionLabels[boat.collectionId]?.es ?? "";
  const collectionHref = `/${locale}/boat/${categorySlug}`;
  const descriptionRich = boat.description?.[locale] ?? boat.description?.es;
  const marina = boat.marina ? getLocalizedValue(boat.marina, locale) : null;
  const galleryImages = [boat.image, ...boat.gallery].filter(Boolean);
  const amenities = (boat.amenities ?? []).map((item) => getAmenityLabel(item, locale)).filter(Boolean);
  const t = (key: string) => uiCopy[key]?.[locale] ?? uiCopy[key]?.es ?? key;
  const hasDescOrAmenities = (descriptionRich?.html) || amenities.length > 0;
  const videoTitle = boat.video?.title ? getLocalizedValue(boat.video.title, locale) : t("video");

  return (
    <main>
      <section className="boat-detail-hero">
        <MediaImage asset={boat.image} locale={locale} sizes="100vw" priority className="boat-detail-hero__media" />
        <div className="container boat-detail-hero__inner">
          <div className="boat-detail-hero__content">
            <Link href={collectionHref} className="boat-detail-hero__tag">{collectionLabel}</Link>
          <h1>{boat.name}</h1>

          {boat.priceLabel && (
              <p className="boat-detail-hero__price">{getLocalizedValue(boat.priceLabel, locale)}</p>
          )}

            <div className="boat-detail-hero__specs">
            {boat.specs.map((spec) => (
              <span key={spec.label.es}>
                <strong>{getLocalizedValue(spec.value, locale)}</strong>{" "}
                {getLocalizedValue(spec.label, locale)}
              </span>
            ))}
          </div>
          </div>
        </div>
      </section>

      {(hasDescOrAmenities || marina) && (
        <section className="boat-detail-info">
          <div className="container boat-detail-info__grid">
            {descriptionRich?.html ? (
              <article className="boat-detail-description">
                <h2>{t("description")}</h2>
                <div
                  className="rich-content"
                  dangerouslySetInnerHTML={{ __html: descriptionRich.html }}
                />
              </article>
            ) : null}

            <aside className="boat-detail-side" aria-label={`${boat.name} ${t("equipment")}`}>
              {amenities.length > 0 ? (
                <div className="boat-detail-side__group">
                  <div className="boat-detail-side__title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M9.153 5.408C10.42 3.136 11.053 2 12 2s1.58 1.136 2.847 3.408l.328.588c.36.646.54.969.82 1.182s.63.292 1.33.45l.636.144c2.46.557 3.689.835 3.982 1.776.292.94-.546 1.921-2.223 3.882l-.434.507c-.476.557-.715.836-.822 1.18-.107.345-.071.717.001 1.46l.066.677c.253 2.617.38 3.925-.386 4.506s-1.918.051-4.22-1.009l-.597-.274c-.654-.302-.981-.452-1.328-.452s-.674.15-1.328.452l-.596.274c-2.303 1.06-3.455 1.59-4.22 1.01-.767-.582-.64-1.89-.387-4.507l.066-.676c.072-.744.108-1.116 0-1.46-.106-.345-.345-.624-.821-1.18l-.434-.508c-1.677-1.96-2.515-2.941-2.223-3.882S3.58 8.328 6.04 7.772l.636-.144c.699-.158 1.048-.237 1.329-.45s.46-.536.82-1.182z" />
                    </svg>
                    <h2>{t("equipment")}</h2>
                  </div>
                  <ul className="boat-detail-equipment">
                    {amenities.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
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
                <WhatsAppCta locale={locale} message={availabilityMessage} label={`${t("book")} ${boat.name}`} />
              </div>
            </aside>
          </div>
        </section>
      )}

      {boat.video?.src ? (
        <section className="boat-detail-video-section" aria-labelledby="boat-detail-video-title">
          <div className="container">
            <h2 id="boat-detail-video-title" className="detail-section-title">{videoTitle}</h2>
            <figure className="boat-detail-video">
              <video controls preload="metadata" poster={boat.image.src} aria-label={videoTitle}>
                <source src={boat.video.src} type={boat.video.mimeType ?? "video/mp4"} />
              </video>
            </figure>
          </div>
        </section>
      ) : null}

      {galleryImages.length > 1 && (
        <DetailGallery assets={galleryImages} locale={locale} title={t("gallery")} />
      )}

      {related.length > 0 && (
        <section className="section section--soft boat-detail-related">
          <div className="container">
            <div className="boat-detail-related__header">
              <h2 className="boat-detail-related__title">
                {t("relatedPrefix")} <Link href={collectionHref}>{collectionLabel}</Link> <em>{t("relatedSuffix")}</em>
              </h2>
            </div>
            <BoatGrid boats={related} locale={locale} />
          </div>
        </section>
      )}

      {boatFaqs.length > 0 && (
        <FaqSection items={boatFaqs} locale={locale} />
      )}

      <ContactFormSection locale={locale} />
    </main>
  );
}
