import { boatCollections } from "@/data/boatCollections";
import { boats } from "@/data/boats";
import { faqs } from "@/data/faqs";
import { securityServices, selfDriveVehicles } from "@/data/serviceOptions";
import { servicePages } from "@/data/services";
import { vehicles } from "@/data/vehicles";
import { waterToys } from "@/data/waterToys";
import { normalizeSlugSegment } from "@/lib/i18n";
import type { Boat, BoatCollection, FaqItem, LocalizedText, RichTextByLocale, SeoPage, ServicePage, ServicePageId, SpecItem, Vehicle, WaterToy } from "@/types/content";

export type AdminContentKey = keyof AdminContentSnapshot["content"];

export interface AdminContentSnapshot {
  version: 1;
  exportedAt: string;
  content: {
    boatCollections: BoatCollection[];
    boats: Boat[];
    servicePages: ServicePage[];
    vehicles: Vehicle[];
    waterToys: WaterToy[];
    seoPages: SeoPage[];
    faqs: FaqItem[];
  };
}

const seoPages: SeoPage[] = [
  {
    id: "seo-ibiza-yacht-charter-guide",
    kind: "seoPage",
    status: "published",
    visibility: "hidden",
    robotsIndex: true,
    slugsByLocale: {
      es: "guia-alquiler-yates-ibiza",
      en: "ibiza-yacht-charter-guide",
      de: "yachtcharter-ibiza-guide",
      nl: "jacht-huren-ibiza-gids"
    },
    title: {
      es: "Guía de alquiler de yates en Ibiza",
      en: "Ibiza yacht charter guide",
      de: "Yachtcharter Ibiza Guide",
      nl: "Gids voor jachten huren op Ibiza"
    },
    eyebrow: {
      es: "Página SEO oculta",
      en: "Hidden SEO page",
      de: "Versteckte SEO-Seite",
      nl: "Verborgen SEO-pagina"
    },
    excerpt: {
      es: "Contenido preparado para posicionar búsquedas long-tail sin aparecer en la navegación principal.",
      en: "Content prepared to rank long-tail searches without appearing in the main navigation."
    },
    body: {
      es: {
        html: "<h2>Alquiler de yates en Ibiza con gestión privada</h2><p>Esta página está pensada para crear contenido SEO específico con enlaces internos, imágenes optimizadas y llamadas a WhatsApp.</p>",
        text: "Alquiler de yates en Ibiza con gestión privada"
      },
      en: {
        html: "<h2>Ibiza yacht charter with private management</h2><p>This page is prepared for focused SEO content with internal links, optimized images and WhatsApp calls.</p>",
        text: "Ibiza yacht charter with private management"
      }
    },
    image: {
      src: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1200&q=80",
      alt: {
        es: "Yate privado navegando en aguas de Ibiza",
        en: "Private yacht cruising in Ibiza waters"
      },
      source: "unsplash"
    },
    gallery: [],
    seoTitle: {
      es: "Guía de alquiler de yates en Ibiza",
      en: "Ibiza yacht charter guide"
    },
    seoDescription: {
      es: "Guía privada para alquilar yates en Ibiza con FastServices, rutas, tipos de barco y disponibilidad por WhatsApp.",
      en: "Private guide to charter yachts in Ibiza with FastServices, routes, yacht types and WhatsApp availability."
    },
    publishedAt: "2026-05-05",
    updatedAt: "2026-05-05",
    schemaType: "Article",
    internalNotes: "Plantilla inicial para páginas SEO ocultas del menú pero indexables."
  }
];

const canonicalServicePageIds: Partial<Record<ServicePage["id"], ServicePageId>> = {
  "service-transfers": "transfers",
  "service-water-toys": "water-toys",
  "service-security": "security",
  "service-self-drive": "self-drive",
  "service-water-taxi": "water-taxi",
  "service-contact": "contact"
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function localized(value: string): LocalizedText {
  return { es: value, en: value, de: value, nl: value, ru: value };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function richTextFromLocalized(value: LocalizedText): RichTextByLocale {
  const fallback = value.es || value.en || "";
  const entries = (["es", "en", "de", "nl", "ru"] as const).map((locale) => {
    const text = value[locale] || fallback;

    return [locale, { html: text ? `<p>${escapeHtml(text)}</p>` : "", text }];
  });

  return Object.fromEntries(entries) as RichTextByLocale;
}

function normalizeSpecs(specs: SpecItem[] | undefined): SpecItem[] {
  return Array.isArray(specs) ? specs : [];
}

function normalizeLocalizedSlugs(slugsByLocale: LocalizedText): LocalizedText {
  return Object.fromEntries(
    Object.entries(slugsByLocale).map(([locale, slug]) => [locale, normalizeSlugSegment(String(slug))])
  ) as LocalizedText;
}

function normalizeVehicle(vehicle: Vehicle): Vehicle {
  return {
    ...vehicle,
    gallery: Array.isArray(vehicle.gallery) ? vehicle.gallery : [],
    specs: normalizeSpecs(vehicle.specs),
    richDescription: vehicle.richDescription ?? richTextFromLocalized(vehicle.overview),
    amenities: vehicle.amenities ?? vehicle.services ?? [],
    marina: vehicle.marina ?? localized("")
  };
}

function normalizeWaterToy(toy: WaterToy): WaterToy {
  return {
    ...toy,
    gallery: Array.isArray(toy.gallery) ? toy.gallery : [],
    specs: normalizeSpecs(toy.specs),
    richDescription: toy.richDescription ?? richTextFromLocalized(toy.details),
    amenities: toy.amenities ?? [],
    marina: toy.marina ?? localized("")
  };
}

function normalizeServiceOptions(options: ServicePage["options"]): ServicePage["options"] {
  return options?.map((option) => ({
    ...option,
    gallery: Array.isArray(option.gallery) ? option.gallery : []
  }));
}

function normalizeServicePage(page: ServicePage): ServicePage {
  const resolvedServiceId = canonicalServicePageIds[page.id] ?? page.serviceId;

  // Si es Taxi Boat y no tiene imagen propia, usa la imagen del seed
  const taxiBoatFallbackImage: ServicePage["image"] = {
    src: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80",
    alt: { es: "Taxi Boat en el puerto de Ibiza", en: "Taxi Boat in Ibiza port", de: "Taxi Boot im Hafen von Ibiza", nl: "Taxi Boot in de haven van Ibiza" },
    source: "unsplash"
  };
  const image = resolvedServiceId === "water-taxi" && !page.image?.src?.trim()
    ? taxiBoatFallbackImage
    : page.image;

  return {
    ...page,
    image,
    serviceId: resolvedServiceId,
    gallery: Array.isArray(page.gallery) ? page.gallery : [],
    specs: normalizeSpecs(page.specs),
    richDescription: page.richDescription,
    amenities: page.amenities ?? [],
    marina: page.marina ?? localized(""),
    options: normalizeServiceOptions(Array.isArray(page.options) ? page.options : getDefaultServiceOptions(resolvedServiceId))
  };
}

function getDefaultServiceOptions(serviceId: string) {
  if (serviceId === "security") return securityServices;
  if (serviceId === "self-drive") return selfDriveVehicles;

  return undefined;
}

export function normalizeAdminContentSnapshot(snapshot: AdminContentSnapshot): AdminContentSnapshot {
  const normalized = clone(snapshot);

  (["boatCollections", "boats", "servicePages", "vehicles", "waterToys", "seoPages"] as const).forEach((key) => {
    normalized.content[key] = normalized.content[key].map((item) => ({
      ...item,
      slugsByLocale: normalizeLocalizedSlugs(item.slugsByLocale),
      status: "published",
      visibility: key === "seoPages" ? "hidden" : "listed",
      robotsIndex: true
    })) as never;
  });

  const collectionSlugsById = new Map(normalized.content.boatCollections.map((collection) => [collection.collectionId, collection.slugsByLocale]));

  normalized.content.boats = normalized.content.boats.map((boat) => ({
    ...boat,
    categorySlugsByLocale: collectionSlugsById.get(boat.collectionId) ?? boat.categorySlugsByLocale
  }));
  normalized.content.vehicles = normalized.content.vehicles.map(normalizeVehicle);
  normalized.content.waterToys = normalized.content.waterToys.map(normalizeWaterToy);
  normalized.content.servicePages = normalized.content.servicePages.map(normalizeServicePage);

  return normalized;
}

export function createInitialAdminSnapshot(): AdminContentSnapshot {
  return normalizeAdminContentSnapshot({
    version: 1,
    exportedAt: new Date().toISOString(),
    content: {
      boatCollections,
      boats,
      servicePages,
      vehicles,
      waterToys,
      seoPages,
      faqs
    }
  });
}

export function isAdminContentSnapshot(value: unknown): value is AdminContentSnapshot {
  if (!value || typeof value !== "object") return false;

  const snapshot = value as Partial<AdminContentSnapshot>;

  return (
    snapshot.version === 1 &&
    !!snapshot.content &&
    Array.isArray(snapshot.content.boats) &&
    Array.isArray(snapshot.content.boatCollections) &&
    Array.isArray(snapshot.content.servicePages) &&
    Array.isArray(snapshot.content.vehicles) &&
    Array.isArray(snapshot.content.waterToys) &&
    Array.isArray(snapshot.content.seoPages) &&
    Array.isArray(snapshot.content.faqs)
  );
}
