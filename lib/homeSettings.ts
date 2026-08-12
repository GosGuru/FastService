import { locales } from "@/lib/i18n";
import type { Boat, BoatCollection, BoatCollectionId, LocalizedText } from "@/types/content";
import { defaultSiteSettings, type HomeSettings, type SiteSettings } from "@/types/settings";

const canonicalCollectionIds: BoatCollectionId[] = ["fast-boats", "yachts", "yachts-xl"];

function clone<T>(value: T): T {
  return structuredClone(value);
}

function normalizeLocalizedText(value: unknown, fallback: LocalizedText): LocalizedText {
  const candidate = value && typeof value === "object" ? value as Partial<LocalizedText> : {};
  return Object.fromEntries(
    locales.map((locale) => [locale, typeof candidate[locale] === "string" && candidate[locale]!.trim() ? candidate[locale] : fallback[locale]])
  ) as LocalizedText;
}

export function cloneDefaultSiteSettings(): SiteSettings {
  return clone(defaultSiteSettings);
}

export function normalizeSiteSettings(value: unknown): SiteSettings {
  const candidate = value && typeof value === "object" ? value as Partial<SiteSettings> : {};
  const home = candidate.home && typeof candidate.home === "object" ? candidate.home as Partial<HomeSettings> : {};
  const hero = (home.hero && typeof home.hero === "object" ? home.hero : {}) as Partial<HomeSettings["hero"]>;
  const featured = (home.featured && typeof home.featured === "object" ? home.featured : {}) as Partial<HomeSettings["featured"]>;
  const categories = (home.categories && typeof home.categories === "object" ? home.categories : {}) as Partial<HomeSettings["categories"]>;

  const collectionIds = Array.isArray(categories.collectionIds)
    ? [...new Set(categories.collectionIds.filter((id): id is BoatCollectionId => canonicalCollectionIds.includes(id as BoatCollectionId)))]
    : [];
  canonicalCollectionIds.forEach((id) => {
    if (!collectionIds.includes(id)) collectionIds.push(id);
  });

  const boatIds = Array.isArray(featured.boatIds)
    ? [...new Set(featured.boatIds.filter((id): id is string => typeof id === "string" && Boolean(id.trim())))]
    : [];
  defaultSiteSettings.home.featured.boatIds.forEach((id) => {
    if (boatIds.length < 4 && !boatIds.includes(id)) boatIds.push(id);
  });

  return {
    whatsappNumbers: { ...defaultSiteSettings.whatsappNumbers, ...(candidate.whatsappNumbers ?? {}) },
    home: {
      version: 1,
      hero: {
        title: normalizeLocalizedText(hero.title, defaultSiteSettings.home.hero.title),
        description: normalizeLocalizedText(hero.description, defaultSiteSettings.home.hero.description)
      },
      featured: {
        title: normalizeLocalizedText(featured.title, defaultSiteSettings.home.featured.title),
        description: normalizeLocalizedText(featured.description, defaultSiteSettings.home.featured.description),
        boatIds: boatIds.slice(0, 4)
      },
      categories: {
        title: normalizeLocalizedText(categories.title, defaultSiteSettings.home.categories.title),
        collectionIds: collectionIds.slice(0, canonicalCollectionIds.length)
      }
    },
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : defaultSiteSettings.updatedAt
  };
}

export function resolveHomeSettings(settings: SiteSettings, boats: Boat[], collections: BoatCollection[]): HomeSettings {
  const normalized = normalizeSiteSettings(settings).home;
  const visibleBoats = boats.filter((boat) => boat.visibility !== "hidden");
  const visibleBoatIds = new Set(visibleBoats.map((boat) => boat.id));
  const boatIds = normalized.featured.boatIds.filter((id) => visibleBoatIds.has(id));

  for (const boat of visibleBoats) {
    if (boatIds.length === 4) break;
    if (!boatIds.includes(boat.id)) boatIds.push(boat.id);
  }

  const availableCollections = new Set(collections.map((collection) => collection.collectionId));
  const collectionIds = normalized.categories.collectionIds.filter((id) => availableCollections.has(id));
  canonicalCollectionIds.forEach((id) => {
    if (availableCollections.has(id) && !collectionIds.includes(id)) collectionIds.push(id);
  });

  return {
    ...clone(normalized),
    featured: { ...clone(normalized.featured), boatIds: boatIds.slice(0, 4) },
    categories: { ...clone(normalized.categories), collectionIds: collectionIds.slice(0, 3) }
  };
}

export function validateHomeSettings(settings: SiteSettings, boats: Boat[], collections: BoatCollection[]): string[] {
  const errors: string[] = [];
  const home = settings.home;

  for (const locale of locales) {
    const fields = [
      ["título del hero", home.hero.title[locale]],
      ["descripción del hero", home.hero.description[locale]],
      ["título de destacados", home.featured.title[locale]],
      ["descripción de destacados", home.featured.description[locale]],
      ["título de categorías", home.categories.title[locale]]
    ];
    fields.forEach(([label, fieldValue]) => {
      if (!String(fieldValue ?? "").trim()) errors.push(`Completa ${label} en ${locale.toUpperCase()}.`);
    });
  }

  const visibleBoatIds = new Set(boats.filter((boat) => boat.visibility !== "hidden").map((boat) => boat.id));
  if (home.featured.boatIds.length !== 4 || new Set(home.featured.boatIds).size !== 4) {
    errors.push("Selecciona exactamente cuatro barcos destacados, sin duplicados.");
  } else if (home.featured.boatIds.some((id) => !visibleBoatIds.has(id))) {
    errors.push("Uno de los barcos destacados ya no existe o está oculto.");
  }

  const availableCollections = new Set(collections.map((collection) => collection.collectionId));
  if (home.categories.collectionIds.length !== 3 || new Set(home.categories.collectionIds).size !== 3) {
    errors.push("Ordena las tres categorías de barcos, sin duplicados.");
  } else if (home.categories.collectionIds.some((id) => !availableCollections.has(id))) {
    errors.push("Una de las categorías configuradas ya no existe.");
  }

  return errors;
}
