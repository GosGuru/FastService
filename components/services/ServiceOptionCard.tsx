import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { MediaImage } from "@/components/MediaImage";
import { getLocalizedValue, uiLabels, type Locale } from "@/lib/i18n";
import type { ServiceOption } from "@/data/serviceOptions";

interface ServiceOptionCardProps {
  option: ServiceOption;
  locale: Locale;
  showAvailabilityPill?: boolean;
}

export function ServiceOptionCard({ option, locale, showAvailabilityPill = true }: ServiceOptionCardProps) {
  return (
    <article className="water-toy-card service-option-card">
      <div className="water-toy-card__image service-option-card__image">
        <MediaImage asset={option.image} locale={locale} sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="water-toy-card__body service-option-card__body">
        {showAvailabilityPill ? <span className="availability-pill">{uiLabels[locale].noPrices}</span> : null}
        <h2>{getLocalizedValue(option.name, locale)}</h2>
        <p>{getLocalizedValue(option.description, locale)}</p>
        <WhatsAppCta locale={locale} message={getLocalizedValue(option.whatsappMessage, locale)} variant="outline" />
      </div>
    </article>
  );
}
