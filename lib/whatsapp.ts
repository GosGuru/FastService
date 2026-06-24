import type { Locale } from "@/lib/i18n";
import type { BoatCollectionId } from "@/types/content";

const defaultPhone = "34655835803";

const defaults: Record<Locale, string> = {
  es: "Hola, quiero consultar disponibilidad para un servicio en Ibiza.",
  en: "Hello, I would like to check availability for a service in Ibiza.",
  de: "Hallo, ich möchte die Verfügbarkeit für einen Service auf Ibiza prüfen.",
  nl: "Hallo, ik wil graag de beschikbaarheid voor een service op Ibiza controleren.",
  ru: "Здравствуйте, хочу узнать о доступности услуги на Ибице."
};

const boatTypeLabels: Record<BoatCollectionId, Record<Locale, string>> = {
  "yachts-xl": {
    es: "Megayate",
    en: "Mega yacht",
    de: "Megayacht",
    nl: "Megajacht",
    ru: "Мегаяхта"
  },
  yachts: {
    es: "Yate",
    en: "Yacht",
    de: "Yacht",
    nl: "Jacht",
    ru: "Яхта"
  },
  "fast-boats": {
    es: "Lancha",
    en: "Speedboat",
    de: "Schnellboot",
    nl: "Speedboot",
    ru: "Катер"
  }
};

export function getBoatTypeLabel(collectionId: BoatCollectionId, locale: Locale): string {
  return boatTypeLabels[collectionId][locale];
}

export function buildBoatAvailabilityMessage(
  locale: Locale,
  collectionId: BoatCollectionId,
  model: string,
  fallbackMessage?: string
) {
  const cleanModel = model.trim();

  if (!cleanModel) return fallbackMessage ?? defaults[locale];

  const boatType = getBoatTypeLabel(collectionId, locale);

  if (locale === "es") return `Hola, quiero consultar disponibilidad del ${boatType} ${cleanModel} en Ibiza.`;
  if (locale === "en") return `Hello, I would like to check availability for the ${boatType} ${cleanModel} in Ibiza.`;
  if (locale === "de") return `Hallo, ich möchte die Verfügbarkeit für die ${boatType} ${cleanModel} auf Ibiza prüfen.`;
  if (locale === "ru") return `Здравствуйте, хочу узнать о доступности ${boatType} ${cleanModel} на Ибице.`;

  return `Hallo, ik wil graag de beschikbaarheid van de ${boatType} ${cleanModel} op Ibiza controleren.`;
}

export function buildWhatsAppUrl(message?: string, locale: Locale = "es", phone?: string) {
  const text = encodeURIComponent(message ?? defaults[locale]);
  const waPhone = phone?.replace(/\D/g, "") || defaultPhone;
  return `https://wa.me/${waPhone}?text=${text}`;
}

export function formatPhoneDisplay(phone?: string): string {
  const cleaned = phone?.replace(/\D/g, "") || defaultPhone;
  if (cleaned.startsWith("34") && cleaned.length === 11) {
    return `+34 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.startsWith("7") && cleaned.length === 11) {
    return `+7 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  return `+${cleaned}`;
}
