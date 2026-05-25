import type { Locale } from "@/lib/i18n";

export type LocalizedText = Record<string, string> & { es: string; en: string } & Partial<Record<Locale, string>>;

export type PublicationStatus = "published";

export type ContentVisibility = "listed" | "hidden";

export type ServiceId = "boats" | "transfers" | "water-toys" | "security" | "self-drive";

export type BoatCollectionId = "yachts-xl" | "yachts" | "fast-boats";

export interface MediaAsset {
  src: string;
  alt: LocalizedText;
  width?: number;
  height?: number;
  source?: "unsplash" | "dropbox" | "local" | "mock" | "supabase";
  dropboxPath?: string;
  storagePath?: string;
}

export interface VideoAsset {
  src: string;
  title?: LocalizedText;
  source?: "local" | "supabase" | "external";
  storagePath?: string;
  mimeType?: string;
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
  visibility?: ContentVisibility;
  robotsIndex?: boolean;
  slugsByLocale: LocalizedText;
  publishedAt: string;
  updatedAt: string;
  schemaType?: string;
}

export interface RichTextContent {
  html: string;
  text?: string;
}

export type RichTextByLocale = Partial<Record<Locale, RichTextContent>>;

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
  video?: VideoAsset;
  specs: SpecItem[];
  priceLabel?: LocalizedText;
  internalBudgetRange?: { min: number; max: number };
  source: "dropbox" | "mock";
  whatsappMessage: LocalizedText;
  /** Rich-text description per locale (same shape as SeoPage.body) */
  description?: RichTextByLocale;
  /** On-board amenities / equipment. Strings are accepted for legacy Supabase payloads. */
  amenities?: Array<string | LocalizedText>;
  /** Home marina / departure port */
  marina?: LocalizedText;
}

export interface ManagedDetailFields {
  gallery?: MediaAsset[];
  specs?: SpecItem[];
  priceLabel?: LocalizedText;
  richDescription?: RichTextByLocale;
  amenities?: Array<string | LocalizedText>;
  marina?: LocalizedText;
}

export interface ServicePage extends BaseContent, ManagedDetailFields {
  kind: "service";
  serviceId: ServiceId | "contact";
  title: LocalizedText;
  eyebrow: LocalizedText;
  description: LocalizedText;
  image: MediaAsset;
  whatsappMessage: LocalizedText;
}

export interface Vehicle extends BaseContent, ManagedDetailFields {
  kind: "vehicle";
  name: string;
  image: MediaAsset;
  gallery: MediaAsset[];
  specs: SpecItem[];
  overview: LocalizedText;
  services: LocalizedText[];
  whatsappMessage: LocalizedText;
}

export interface WaterToy extends BaseContent, ManagedDetailFields {
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

export interface SeoPage extends BaseContent {
  kind: "seoPage";
  title: LocalizedText;
  eyebrow: LocalizedText;
  excerpt: LocalizedText;
  body: Partial<Record<Locale, RichTextContent>> & { es: RichTextContent; en: RichTextContent };
  image: MediaAsset;
  gallery: MediaAsset[];
  internalNotes?: string;
}

export interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  serviceId?: ServiceId;
}
