import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import { getWaterToyPath } from "@/lib/routes";
import { getLocalizedSlug, getLocalizedValue, uiLabels, type Locale } from "@/lib/i18n";
import type { WaterToy } from "@/types/content";

interface WaterToyCardProps {
  toy: WaterToy;
  locale: Locale;
  sectionSlug?: string;
}

export function WaterToyCard({ toy, locale, sectionSlug }: WaterToyCardProps) {
  const href = sectionSlug ? `/${locale}/${sectionSlug}/${getLocalizedSlug(toy.slugsByLocale, locale)}` : getWaterToyPath(toy.id, locale);

  return (
    <article className="water-toy-card">
      <ImageCarousel assets={[toy.image, ...toy.gallery]} locale={locale} href={href} ariaLabel={getLocalizedValue(toy.name, locale)} className="water-toy-card__image" sizes="(max-width: 768px) 100vw, 33vw" />
      <div className="water-toy-card__body">
        <span className="availability-pill">{uiLabels[locale].noPrices}</span>
        <h2>{getLocalizedValue(toy.name, locale)}</h2>
        <p>{getLocalizedValue(toy.description, locale)}</p>
        <WhatsAppCta locale={locale} message={getLocalizedValue(toy.whatsappMessage, locale)} variant="outline" />
      </div>
    </article>
  );
}