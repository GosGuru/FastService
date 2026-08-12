import type { Locale } from "@/lib/i18n";
import type { BoatCollectionId, LocalizedText } from "@/types/content";

export interface HomeSettings {
  version: 1;
  hero: {
    title: LocalizedText;
    description: LocalizedText;
  };
  featured: {
    title: LocalizedText;
    description: LocalizedText;
    boatIds: string[];
  };
  categories: {
    title: LocalizedText;
    collectionIds: BoatCollectionId[];
  };
}

export interface SiteSettings {
  whatsappNumbers: Partial<Record<Locale, string>> & { default: string };
  home: HomeSettings;
  updatedAt: string;
}

export const defaultHomeSettings: HomeSettings = {
  version: 1,
  hero: {
    title: {
      es: "Alquiler de barcos en Ibiza & Formentera",
      en: "Boat rental in Ibiza & Formentera",
      de: "Bootsverleih auf Ibiza & Formentera",
      nl: "Bootverhuur op Ibiza & Formentera",
      ru: "Аренда яхт на Ибице и Форментере"
    },
    description: {
      es: "Barcos, transfers privados y juguetes náuticos coordinados desde una sola conversación.",
      en: "Boats, private transfers and water toys coordinated from a single conversation.",
      de: "Boote, private Transfers und Wasserspielzeug aus einer einzigen Unterhaltung koordiniert.",
      nl: "Boten, privétransfers en waterspeelgoed geregeld vanuit één gesprek.",
      ru: "Яхты, частные трансферы и водные развлечения — всё из одного разговора."
    }
  },
  featured: {
    title: {
      es: "Barcos destacados",
      en: "Featured boats",
      de: "Ausgewählte Boote",
      nl: "Uitgelichte boten",
      ru: "Популярные яхты"
    },
    description: {
      es: "Algunos de nuestros barcos más demandados.",
      en: "Some of our most requested boats.",
      de: "Einige unserer gefragtesten Boote.",
      nl: "Enkele van onze meest gevraagde boten.",
      ru: "Некоторые из наших самых востребованных яхт."
    },
    boatIds: ["pershing-90", "cranchi-50", "monte-carlo-37", "riva-argo-90"]
  },
  categories: {
    title: {
      es: "Tres formas de vivir el Mediterráneo",
      en: "Three ways to experience the Mediterranean",
      de: "Drei Arten, das Mittelmeer zu erleben",
      nl: "Drie manieren om de Middellandse Zee te beleven",
      ru: "Три способа открыть Средиземное море"
    },
    collectionIds: ["fast-boats", "yachts", "yachts-xl"]
  }
};

export const defaultSiteSettings: SiteSettings = {
  whatsappNumbers: {
    default: "34655835803",
    es: "34655835803",
    en: "34655835803",
    de: "34655835803",
    nl: "34655835803",
    ru: "34655835803"
  },
  home: defaultHomeSettings,
  updatedAt: new Date().toISOString()
};

export function getWhatsAppNumber(settings: SiteSettings, locale: Locale): string {
  return settings.whatsappNumbers[locale] ?? settings.whatsappNumbers.default ?? defaultSiteSettings.whatsappNumbers.default!;
}
