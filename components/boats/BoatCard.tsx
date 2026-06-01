import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { PiBathtub, PiBed, PiRuler, PiUsers } from "react-icons/pi";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import type { Boat } from "@/types/content";
import { getLocalizedSlug, getLocalizedValue, type Locale } from "@/lib/i18n";
import { buildBoatAvailabilityMessage, buildWhatsAppUrl, getBoatTypeLabel } from "@/lib/whatsapp";

const icons = {
  cabins: PiBed,
  length: PiRuler,
  passengers: PiUsers,
  bathrooms: PiBathtub
};

const cardLabels: Record<Locale, { details: string; view: string; availability: string; metres: string }> = {
  es: { details: "Más información", view: "Ver modelo", availability: "Disponibilidad", metres: "Metros" },
  en: { details: "More information", view: "View model", availability: "Availability", metres: "Metres" },
  de: { details: "Mehr Informationen", view: "Modell ansehen", availability: "Verfügbarkeit", metres: "Meter" },
  nl: { details: "Meer informatie", view: "Model bekijken", availability: "Beschikbaarheid", metres: "Meter" }
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
  const waMessage = buildBoatAvailabilityMessage(locale, boat.collectionId, boat.name, getLocalizedValue(boat.whatsappMessage, locale));
  const waHref = buildWhatsAppUrl(waMessage, locale);

  const formatSpec = (spec: Boat["specs"][number]) => {
    const value = getLocalizedValue(spec.value, locale);
    if (spec.icon === "length") return `${value.replace(/\s*m$/i, "")} ${labels.metres}`;

    return `${value} ${getLocalizedValue(spec.label, locale)}`;
  };

  return (
    <article className="boat-card">
      <ImageCarousel
        assets={[boat.image, ...boat.gallery]}
        locale={locale}
        href={cardHref}
        ariaLabel={`${labels.details}: ${boat.name}`}
        className="boat-card__image"
        sizes="(max-width: 760px) 88vw, (max-width: 1180px) 46vw, 32vw"
        showFullscreen={false}
        variant="card"
      />

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

      <div className="boat-card__actions">
        <Link href={waHref} className="boat-card__btn boat-card__btn--wa" target="_blank" rel="noreferrer">
          <FaWhatsapp aria-hidden="true" />
          <span>{labels.availability}</span>
        </Link>
        <Link href={cardHref} className="boat-card__btn boat-card__btn--detail">
          <span>{labels.view}</span>
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
