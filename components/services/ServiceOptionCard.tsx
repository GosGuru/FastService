import { CardActions } from "@/components/cards/CardActions";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import { NoWidowText } from "@/components/typography/NoWidowText";
import { getLocalizedValue, uiLabels, type Locale } from "@/lib/i18n";
import type { ServiceOption } from "@/types/content";

interface ServiceOptionCardProps {
  option: ServiceOption;
  locale: Locale;
  detailHref?: string;
  showAvailabilityPill?: boolean;
}

export function ServiceOptionCard({ option, locale, detailHref, showAvailabilityPill = true }: ServiceOptionCardProps) {
  const resolvedDetailHref = detailHref ?? `#${option.id}`;

  return (
    <article className="water-toy-card service-option-card" id={option.id}>
      <ImageCarousel
        assets={[option.image, ...(option.gallery ?? [])]}
        locale={locale}
        href={resolvedDetailHref}
        ariaLabel={getLocalizedValue(option.name, locale)}
        className="water-toy-card__image service-option-card__image"
        sizes="(max-width: 768px) 100vw, 33vw"
        showFullscreen={false}
        variant="card"
      />
      <div className="water-toy-card__body service-option-card__body">
        {showAvailabilityPill ? <span className="availability-pill">{uiLabels[locale].noPrices}</span> : null}
        <h2>{getLocalizedValue(option.name, locale)}</h2>
        <p>
          <NoWidowText text={getLocalizedValue(option.description, locale)} />
        </p>
        <CardActions locale={locale} whatsappMessage={getLocalizedValue(option.whatsappMessage, locale)} detailHref={resolvedDetailHref} />
      </div>
    </article>
  );
}
