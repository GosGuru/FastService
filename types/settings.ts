import type { Locale } from "@/lib/i18n";

export interface SiteSettings {
  whatsappNumbers: Partial<Record<Locale, string>> & { default: string };
  updatedAt: string;
}

export const defaultSiteSettings: SiteSettings = {
  whatsappNumbers: {
    default: "34655835803",
    es: "34655835803",
    en: "34655835803",
    de: "34655835803",
    nl: "34655835803",
    ru: "34655835803"
  },
  updatedAt: new Date().toISOString()
};

export function getWhatsAppNumber(settings: SiteSettings, locale: Locale): string {
  return settings.whatsappNumbers[locale] ?? settings.whatsappNumbers.default ?? defaultSiteSettings.whatsappNumbers.default!;
}
