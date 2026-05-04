import Link from "next/link";
import { PiBed, PiBathtub, PiRuler, PiUsers } from "react-icons/pi";
import { MediaImage } from "@/components/MediaImage";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
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
  return (
    <article className="boat-card">
      <Link href={href ?? "#"} className="boat-card__image" aria-label={boat.name}>
        <MediaImage asset={boat.image} locale={locale} sizes="(max-width: 768px) 100vw, 33vw" />
      </Link>
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