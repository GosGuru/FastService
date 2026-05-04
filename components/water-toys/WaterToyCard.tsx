import Link from "next/link";
import { MediaImage } from "@/components/MediaImage";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { getWaterToyPath } from "@/lib/routes";
import { getLocalizedValue, uiLabels, type Locale } from "@/lib/i18n";
import type { WaterToy } from "@/types/content";

interface WaterToyCardProps {
  toy: WaterToy;
  locale: Locale;
}

export function WaterToyCard({ toy, locale }: WaterToyCardProps) {
  return (
    <article className="water-toy-card">
      <Link href={getWaterToyPath(toy.id, locale)} className="water-toy-card__image">
        <MediaImage asset={toy.image} locale={locale} sizes="(max-width: 768px) 100vw, 33vw" />
      </Link>
      <div className="water-toy-card__body">
        <span className="availability-pill">{uiLabels[locale].noPrices}</span>
        <h2>{getLocalizedValue(toy.name, locale)}</h2>
        <p>{getLocalizedValue(toy.description, locale)}</p>
        <WhatsAppCta locale={locale} message={getLocalizedValue(toy.whatsappMessage, locale)} variant="outline" />
      </div>
    </article>
  );
}