import type { Locale } from "@/lib/i18n";

export type LocalizedText = Record<string, string> & { es: string; en: string } & Partial<Record<Locale, string>>;

export type PublicationStatus = "draft" | "published" | "hidden";

export type ServiceId = "boats" | "transfers" | "water-toys";

export type BoatCollectionId = "yachts-xl" | "yachts" | "fast-boats";

export interface MediaAsset {
  src: string;
  alt: LocalizedText;
  width?: number;
  height?: number;
  source?: "unsplash" | "dropbox" | "local" | "mock";
  dropboxPath?: string;
}

export interface SeoFields {
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  canonicalPath?: LocalizedText;
  alternatePaths?: LocalizedText;
}

export interface BaseContent extends SeoFields {
  id: string;
  status: PublicationStatus;
  slugsByLocale: LocalizedText;
  publishedAt: string;
  updatedAt: string;
  schemaType?: string;
}

export interface SpecItem {
  label: LocalizedText;
  value: LocalizedText;
  icon?: "cabins" | "length" | "passengers" | "bathrooms" | "bags" | "comfort" | "water";
}

export interface BoatCollection extends BaseContent {
  kind: "boatCollection";
  collectionId: BoatCollectionId;
  title: LocalizedText;
  eyebrow: LocalizedText;
  description: LocalizedText;
  image: MediaAsset;
  countTarget: number;
  hiddenPage: boolean;
  selectionNote: LocalizedText;
  whatsappMessage: LocalizedText;
}

export interface Boat extends BaseContent {
  kind: "boat";
  name: string;
  collectionId: BoatCollectionId;
  categorySlugsByLocale: LocalizedText;
  image: MediaAsset;
  gallery: MediaAsset[];
  specs: SpecItem[];
  priceLabel?: LocalizedText;
  internalBudgetRange?: { min: number; max: number };
  source: "dropbox" | "mock";
  whatsappMessage: LocalizedText;
}

export interface ServicePage extends BaseContent {
  kind: "service";
  serviceId: ServiceId | "contact";
  title: LocalizedText;
  eyebrow: LocalizedText;
  description: LocalizedText;
  image: MediaAsset;
  whatsappMessage: LocalizedText;
}

export interface Vehicle extends BaseContent {
  kind: "vehicle";
  name: string;
  image: MediaAsset;
  gallery: MediaAsset[];
  specs: SpecItem[];
  overview: LocalizedText;
  services: LocalizedText[];
  whatsappMessage: LocalizedText;
}

export interface WaterToy extends BaseContent {
  kind: "waterToy";
  name: LocalizedText;
  image: MediaAsset;
  gallery: MediaAsset[];
  description: LocalizedText;
  details: LocalizedText;
  whatsappMessage: LocalizedText;
}

export interface BlogPost extends BaseContent {
  kind: "post";
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText[];
  image: MediaAsset;
  category: LocalizedText;
}

export interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  serviceId?: ServiceId;
}