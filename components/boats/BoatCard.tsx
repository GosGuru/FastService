import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { PiBathtub, PiBed, PiRuler, PiUsers } from "react-icons/pi";
import { MediaImage } from "@/components/MediaImage";
import type { Boat } from "@/types/content";
import { getLocalizedSlug, getLocalizedValue, type Locale } from "@/lib/i18n";
import { getBoatTypeLabel } from "@/lib/whatsapp";

const icons = {
  cabins: PiBed,
  length: PiRuler,
  passengers: PiUsers,
  bathrooms: PiBathtub
};

const cardLabels: Record<Locale, { details: string; metres: string }> = {
  es: { details: "Más información", metres: "Metros" },
  en: { details: "More information", metres: "Metres" },
  de: { details: "Mehr Informationen", metres: "Meter" },
  nl: { details: "Meer informatie", metres: "Meter" }
};

interface BoatCardProps {
  boat: Boat;
  locale: Locale;
  href?: string;
}

export function BoatCard({ boat, locale, href }: BoatCardProps) {
  const labels = cardLabels[locale];
  const cardHref = href ?? `/${locale}/boat/${getLocalizedSlug(boat.categorySlugsByLocale, locale)}/${getLocalizedSlug(boat.slugsByLocale, locale)}`;
  const boatTypeLabel = getBoatTypeLabel(boat.collectionId, locale);

  const formatSpec = (spec: Boat["specs"][number]) => {
    const value = getLocalizedValue(spec.value, locale);
    if (spec.icon === "length") return `${value.replace(/\s*m$/i, "")} ${labels.metres}`;

    return `${value} ${getLocalizedValue(spec.label, locale)}`;
  };

  return (
    <article className="boat-card">
      <Link href={cardHref} className="boat-card__image" aria-label={`${labels.details}: ${boat.name}`}>
        <MediaImage asset={boat.image} locale={locale} sizes="(max-width: 760px) 88vw, (max-width: 1180px) 42vw, 25vw" />
        <span className="boat-card__image-link">{labels.details}</span>
      </Link>

      <div className="boat-card__body">
        <div className="boat-card__meta">
          <span>{boatTypeLabel}</span>
          {boat.priceLabel ? <strong>{getLocalizedValue(boat.priceLabel, locale)}</strong> : null}
        </div>
        <h2>
          <Link href={cardHref}>{boat.name}</Link>
        </h2>
        <div className="boat-card__specs">
          {boat.specs.slice(0, 4).map((spec) => {
            const Icon = icons[spec.icon as keyof typeof icons] ?? PiRuler;
            return (
              <span key={`${boat.id}-${spec.label.es}`}>
                <Icon aria-hidden="true" /> {formatSpec(spec)}
              </span>
            );
          })}
        </div>
      </div>

      <Link href={cardHref} className="boat-card__cta">
        <span>{labels.details}</span>
        <FiArrowRight aria-hidden="true" />
      </Link>
    </article>
  );
}