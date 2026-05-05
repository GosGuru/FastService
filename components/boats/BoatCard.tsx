import { PiBed, PiBathtub, PiRuler, PiUsers } from "react-icons/pi";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import type { Boat } from "@/types/content";
import { getLocalizedValue, type Locale } from "@/lib/i18n";

const icons = {
  cabins: PiBed,
  length: PiRuler,
  passengers: PiUsers,
  bathrooms: PiBathtub
};

interface BoatCardProps {
  boat: Boat;
  locale: Locale;
  href?: string;
}

export function BoatCard({ boat, locale, href }: BoatCardProps) {
  const cardHref = href ?? "#";

  return (
    <article className="boat-card">
      <ImageCarousel assets={[boat.image, ...boat.gallery]} locale={locale} href={cardHref} ariaLabel={boat.name} className="boat-card__image" sizes="(max-width: 768px) 100vw, 33vw" />
      <div className="boat-card__body">
        <div className="boat-card__meta">
          <span>{boat.collectionId === "yachts-xl" ? "Megayate" : boat.collectionId === "fast-boats" ? "Lancha" : "Yate"}</span>
          {boat.priceLabel ? <strong>{getLocalizedValue(boat.priceLabel, locale)}</strong> : null}
        </div>
        <h2>{boat.name}</h2>
        <div className="spec-grid">
          {boat.specs.map((spec) => {
            const Icon = icons[spec.icon as keyof typeof icons] ?? PiRuler;
            return (
              <span key={`${boat.id}-${spec.label.es}`}>
                <Icon aria-hidden="true" /> {getLocalizedValue(spec.value, locale)} {getLocalizedValue(spec.label, locale)}
              </span>
            );
          })}
        </div>
        <WhatsAppCta locale={locale} message={getLocalizedValue(boat.whatsappMessage, locale)} variant="outline" />
      </div>
    </article>
  );
}