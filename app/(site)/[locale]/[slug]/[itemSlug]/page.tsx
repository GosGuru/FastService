import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailGallery } from "@/components/media/DetailGallery";
import { MediaImage } from "@/components/MediaImage";
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

const detailCopy: Record<string, Record<string, string>> = {
  book: { es: "Reservar", en: "Book Now", de: "Jetzt buchen", nl: "Nu boeken" },
  description: { es: "Descripción", en: "Description", de: "Beschreibung", nl: "Omschrijving" },
  equipment: { es: "Equipamiento", en: "Equipment", de: "Ausstattung", nl: "Uitrusting" },
  gallery: { es: "Galería", en: "Gallery", de: "Galerie", nl: "Galerij" },
  transfer: { es: "Transfer privado", en: "Private transfer", de: "Privattransfer", nl: "Privétransfer" },
  waterToy: { es: "Juguete náutico", en: "Water toy", de: "Wasserspielzeug", nl: "Waterspeelgoed" }
};

function t(key: string, locale: Locale) {
  return detailCopy[key]?.[locale] ?? detailCopy[key]?.es ?? key;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAmenityLabel(item: string | Record<string, string>, locale: Locale) {
  return typeof item === "string" ? item : getLocalizedValue(item, locale);
}

export default async function ItemPage({ params }: Props) {
  const { locale: rawLocale, slug, itemSlug } = await params;
  const locale = assertLocale(rawLocale) as Locale;
  const [item, section] = await Promise.all([
    getItemBySectionAndSlug(locale, slug, itemSlug),
    getServicePageBySlug(locale, slug)
  ]);

  if (!item) notFound();

  const title = item.kind === "vehicle" ? item.name : getLocalizedValue(item.name, locale);
  const summary = item.kind === "vehicle" ? getLocalizedValue(item.overview, locale) : getLocalizedValue(item.details, locale);
  const richDescription = item.richDescription?.[locale] ?? item.richDescription?.es ?? { html: summary ? `<p>${escapeHtml(summary)}</p>` : "", text: summary };
  const specs = item.specs ?? [];
  const priceText = item.priceLabel ? getLocalizedValue(item.priceLabel, locale).trim() : "";
  const marina = item.marina ? getLocalizedValue(item.marina, locale) : "";
  const amenities = (item.kind === "vehicle" ? item.amenities ?? item.services : item.amenities ?? []).flatMap((amenity) => {
    const label = getAmenityLabel(amenity, locale);

    return label ? [label] : [];
  });
  const galleryImages = [item.image, ...(item.gallery ?? [])];
  const sectionHref = section ? `/${locale}/${getLocalizedSlug(section.slugsByLocale, locale)}` : `/${locale}/${slug}`;
  const eyebrow = item.kind === "vehicle" ? t("transfer", locale) : t("waterToy", locale);

  return (
    <main>
      <section className="boat-detail-hero">
        <MediaImage asset={item.image} locale={locale} sizes="100vw" priority className="boat-detail-hero__media" />
        <div className="container boat-detail-hero__inner">
          <div className="boat-detail-hero__content">
            <Link href={sectionHref} className="boat-detail-hero__tag">{eyebrow}</Link>
            <h1>{title}</h1>

            {priceText ? (
              <p className="boat-detail-hero__price">{priceText}</p>
            ) : null}

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
          </div>
        </div>
      </section>

      {(richDescription.html || amenities.length > 0 || marina) ? (
        <section className="boat-detail-info">
          <div className="container boat-detail-info__grid">
            {richDescription.html ? (
              <article className="boat-detail-description">
                <h2>{t("description", locale)}</h2>
                <div className="rich-content" dangerouslySetInnerHTML={{ __html: richDescription.html }} />
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
                <WhatsAppCta locale={locale} message={getLocalizedValue(item.whatsappMessage, locale)} label={`${t("book", locale)} ${title}`} />
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      {galleryImages.length > 1 ? (
        <DetailGallery assets={galleryImages} locale={locale} title={t("gallery", locale)} />
      ) : null}
    </main>
  );
}
