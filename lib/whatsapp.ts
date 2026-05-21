import type { Locale } from "@/lib/i18n";
import type { BoatCollectionId } from "@/types/content";

const whatsappPhone = "34671338141";

const defaults: Record<Locale, string> = {
  es: "Hola, quiero consultar disponibilidad para un servicio en Ibiza.",
  en: "Hello, I would like to check availability for a service in Ibiza.",
  de: "Hallo, ich möchte die Verfügbarkeit für einen Service auf Ibiza prüfen.",
  nl: "Hallo, ik wil graag de beschikbaarheid voor een service op Ibiza controleren."
};

const boatTypeLabels: Record<BoatCollectionId, Record<Locale, string>> = {
  "yachts-xl": {
    es: "Megayate",
    en: "Mega yacht",
    de: "Megayacht",
    nl: "Megajacht"
  },
  yachts: {
    es: "Yate",
    en: "Yacht",
    de: "Yacht",
    nl: "Jacht"
  },
  "fast-boats": {
    es: "Lancha",
    en: "Speedboat",
    de: "Schnellboot",
    nl: "Speedboot"
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

  return `Hallo, ik wil graag de beschikbaarheid van de ${boatType} ${cleanModel} op Ibiza controleren.`;
}

export function buildWhatsAppUrl(message?: string, locale: Locale = "es") {
  const text = encodeURIComponent(message ?? defaults[locale]);
  return `https://wa.me/${whatsappPhone}?text=${text}`;
}