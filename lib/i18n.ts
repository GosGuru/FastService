export const locales = ["es", "en", "de", "nl"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const languageNames: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  de: "DE",
  nl: "NL"
};

export const languageOptions = [
  { locale: "en", code: "EN", name: "English" },
  { locale: "de", code: "DE", name: "Deutsch" },
  { locale: "es", code: "ES", name: "Español" },
  { locale: "nl", code: "NL", name: "Nederlands" }
] satisfies Array<{ locale: Locale; code: string; name: string }>;

export type LocalizedValue = Partial<Record<Locale, string>> & { es?: string; en?: string };

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://fastservices.example";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function assertLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function getLocalizedValue(value: LocalizedValue, locale: Locale) {
  return value[locale] ?? value[defaultLocale] ?? value.en ?? "";
}

function decodeSlugSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeSlugSegment(value: string) {
  return decodeSlugSegment(value)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLocalizedSlug(value: LocalizedValue, locale: Locale) {
  return normalizeSlugSegment(getLocalizedValue(value, locale));
}

export function localizedPath(locale: Locale, path = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}

export const uiLabels = {
  es: {
    services: "Servicios",
    boats: "Alquiler de barcos",
    mobileBoatsTab: "Alquiler de yates",
    mobilePagesTab: "Servicios",
    transfers: "Transfer privado",
    waterToys: "Juguetes náuticos",
    security: "Seguridad",
    selfDriveVehicles: "Vehículos sin conductor",
    news: "Noticias",
    contact: "Contacto",
    availability: "Consultar disponibilidad",
    viewFleet: "Ver selección",
    exploreFleet: "Explora nuestra flota",
    whatsapp: "WhatsApp",
    menu: "Abrir menú",
    close: "Cerrar menú",
    language: "Cambiar idioma",
    passengers: "Pasajeros",
    cabins: "Cabinas",
    length: "Eslora",
    bathrooms: "Baños",
    from: "Desde",
    noPrices: "Disponibilidad y propuesta a medida por WhatsApp"
  },
  en: {
    services: "Services",
    boats: "Boat rentals",
    mobileBoatsTab: "Yacht rentals",
    mobilePagesTab: "Services",
    transfers: "Private transfers",
    waterToys: "Water toys",
    security: "Security",
    selfDriveVehicles: "Self-drive vehicles",
    news: "News",
    contact: "Contact",
    availability: "Check availability",
    viewFleet: "View selection",
    exploreFleet: "Explore our fleet",
    whatsapp: "WhatsApp",
    menu: "Open menu",
    close: "Close menu",
    language: "Change language",
    passengers: "Guests",
    cabins: "Cabins",
    length: "Length",
    bathrooms: "Bathrooms",
    from: "From",
    noPrices: "Availability and tailored proposal by WhatsApp"
  },
  de: {
    services: "Services",
    boats: "Yachten mieten",
    mobileBoatsTab: "Yachten mieten",
    mobilePagesTab: "Services",
    transfers: "Privattransfer",
    waterToys: "Wasserspielzeug",
    security: "Sicherheit",
    selfDriveVehicles: "Mietwagen ohne Fahrer",
    news: "News",
    contact: "Kontakt",
    availability: "Verfügbarkeit anfragen",
    viewFleet: "Auswahl ansehen",
    exploreFleet: "Flotte entdecken",
    whatsapp: "WhatsApp",
    menu: "Menü öffnen",
    close: "Menü schließen",
    language: "Sprache wechseln",
    passengers: "Gäste",
    cabins: "Kabinen",
    length: "Länge",
    bathrooms: "Bäder",
    from: "Ab",
    noPrices: "Verfügbarkeit und Angebot nach Maß per WhatsApp"
  },
  nl: {
    services: "Services",
    boats: "Jachten huren",
    mobileBoatsTab: "Jachten huren",
    mobilePagesTab: "Services",
    transfers: "Privétransfers",
    waterToys: "Waterspeelgoed",
    security: "Beveiliging",
    selfDriveVehicles: "Auto zonder chauffeur",
    news: "Nieuws",
    contact: "Contact",
    availability: "Beschikbaarheid aanvragen",
    viewFleet: "Selectie bekijken",
    exploreFleet: "Vloot bekijken",
    whatsapp: "WhatsApp",
    menu: "Menu openen",
    close: "Menu sluiten",
    language: "Taal wijzigen",
    passengers: "Gasten",
    cabins: "Cabines",
    length: "Lengte",
    bathrooms: "Badkamers",
    from: "Vanaf",
    noPrices: "Beschikbaarheid en voorstel op maat via WhatsApp"
  }
} satisfies Record<Locale, Record<string, string>>;
