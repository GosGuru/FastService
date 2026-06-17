import { MediaImage } from "@/components/MediaImage";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { getLocalizedValue, type Locale } from "@/lib/i18n";
import type { BoatCollection } from "@/types/content";

const bannerCopy: Record<Locale, { titleStart: string; titleEnd: string; text: string; cta: string }> = {
  es: {
    titleStart: "Tipos de",
    titleEnd: "disponibles para alquiler en Ibiza",
    text: "Te ayudo a elegir la embarcación, la ruta y los extras adecuados según fecha, grupo y estilo de día.",
    cta: "Descubre la disponibilidad"
  },
  en: {
    titleStart: "Types of",
    titleEnd: "available to rent in Ibiza",
    text: "I help you choose the right boat, route and extras based on your date, group and style of day.",
    cta: "Check availability"
  },
  de: {
    titleStart: "Verfügbare",
    titleEnd: "zum Mieten auf Ibiza",
    text: "Ich helfe dir, Boot, Route und Extras passend zu Datum, Gruppe und Tagesstil zu wählen.",
    cta: "Verfügbarkeit prüfen"
  },
  nl: {
    titleStart: "Beschikbare",
    titleEnd: "om te huren op Ibiza",
    text: "Ik help je de juiste boot, route en extra's te kiezen op basis van datum, groep en dagstijl.",
    cta: "Beschikbaarheid checken"
  },
  ru: {
    titleStart: "Типы",
    titleEnd: "доступных для аренды на Ибице",
    text: "Я помогу вам выбрать подходящую яхту, маршрут и дополнения в зависимости от даты, группы и стиля отдыха.",
    cta: "Узнать о доступности"
  }
};

interface BoatCtaBannerProps {
  collection: BoatCollection;
  locale: Locale;
}

export function BoatCtaBanner({ collection, locale }: BoatCtaBannerProps) {
  const copy = bannerCopy[locale];
  const collectionTitle = getLocalizedValue(collection.title, locale).toLocaleLowerCase(locale);

  const whatsappCtaLabel = collection.whatsappLabel
    ? getLocalizedValue(collection.whatsappLabel, locale).trim()
    : undefined;

  const showWhatsappButton = !collection.hideWhatsappButton &&
    (collection.whatsappLabel === undefined || whatsappCtaLabel !== "");

  return (
    <section className="boat-cta-banner" aria-labelledby={`boat-cta-${collection.id}`}>
      <div className="boat-cta-banner__media">
        <MediaImage asset={collection.image} locale={locale} sizes="100vw" />
      </div>
      <div className="boat-cta-banner__overlay" />
      <div className="container boat-cta-banner__content">
        <h2 id={`boat-cta-${collection.id}`}>
          {copy.titleStart} {collectionTitle} {copy.titleEnd}
        </h2>
        <p>{copy.text}</p>
        {showWhatsappButton && (
          <WhatsAppCta locale={locale} label={whatsappCtaLabel || copy.cta} message={getLocalizedValue(collection.whatsappMessage, locale)} variant="light" />
        )}
      </div>
    </section>
  );
}