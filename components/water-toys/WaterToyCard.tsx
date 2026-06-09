import { CardActions } from "@/components/cards/CardActions";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import { NoWidowText } from "@/components/typography/NoWidowText";
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
      <ImageCarousel assets={[toy.image, ...toy.gallery]} locale={locale} href={href} ariaLabel={getLocalizedValue(toy.name, locale)} className="water-toy-card__image" sizes="(max-width: 768px) 100vw, 33vw" showFullscreen={false} variant="card" />
      <div className="water-toy-card__body">
        <h2>{getLocalizedValue(toy.name, locale)}</h2>
        <p>
          <NoWidowText text={getLocalizedValue(toy.description, locale)} />
        </p>
        <CardActions locale={locale} whatsappMessage={getLocalizedValue(toy.whatsappMessage, locale)} detailHref={href} showDetail={false} />
      </div>
    </article>
  );
}
