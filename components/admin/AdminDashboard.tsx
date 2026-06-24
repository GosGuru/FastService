"use client";

import { type CSSProperties, type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FiAlertCircle, FiAnchor, FiBold, FiBriefcase, FiCheckCircle, FiChevronDown, FiChevronLeft, FiChevronUp, FiCopy, FiDroplet, FiExternalLink, FiEye, FiEyeOff, FiFileText, FiGlobe, FiHelpCircle, FiImage, FiItalic, FiLayers, FiLoader, FiLogOut, FiMenu, FiMessageCircle, FiMove, FiPlus, FiSave, FiSearch, FiSettings, FiStar, FiTrash2, FiTruck, FiUploadCloud, FiVideo } from "react-icons/fi";
import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { translateItemAction, type AdminMutationResult } from "@/app/admin/actions";
import { MediaImage } from "@/components/MediaImage";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { normalizeAdminContentSnapshot, type AdminContentKey, type AdminContentSnapshot } from "@/lib/admin/snapshot";
import { getLocalizedSlug, getLocalizedValue, locales, normalizeSlugSegment, type Locale } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { supabaseGalleryBucket } from "@/lib/supabase/config";
import { publicServiceIds, servicePageIds, type Boat, type BoatCollection, type FaqItem, type LocalizedText, type MediaAsset, type RichTextByLocale, type SeoPage, type ServiceId, type ServiceOption, type ServicePage, type ServicePageId, type SpecItem, type Vehicle, type VideoAsset, type WaterToy } from "@/types/content";
import type { SiteSettings } from "@/types/settings";

type AdminItem = AdminContentSnapshot["content"][AdminContentKey][number];
type GenericContentItem = BoatCollection;
type ManagedDetailsPatch = Partial<Pick<Vehicle, "image" | "gallery" | "specs" | "slugsByLocale" | "seoTitle" | "seoDescription" | "priceLabel" | "marina" | "richDescription" | "amenities" | "whatsappMessage">>;

type FeedbackTone = "info" | "success" | "error";

interface AdminSaveStatus {
  tone: FeedbackTone;
  title: string;
  message: string;
  details?: string[];
}

interface UploadQueueItem {
  id: string;
  name: string;
  status: "pending" | "uploading" | "done" | "error";
  message?: string;
}

const sectionConfig = [
  { key: "boats", label: "Barcos", description: "Yates XL, yates y embarcaciones rápidas", icon: FiAnchor, tone: "boats" },
  { key: "boatCollections", label: "Colecciones", description: "Categorías públicas de barcos", icon: FiLayers, tone: "collections" },
  { key: "vehicles", label: "Transfer", description: "Vehículos y traslados privados", icon: FiTruck, tone: "transfers" },
  { key: "waterToys", label: "Juguetes", description: "Juguetes náuticos y disponibilidad", icon: FiDroplet, tone: "water" },
  { key: "servicePages", label: "Servicios", description: "Landings principales y mensajes de venta", icon: FiBriefcase, tone: "services" },
  { key: "seoPages", label: "SEO ocultas", description: "Páginas SEO fuera del menú", icon: FiGlobe, tone: "seo" },
  { key: "faqs", label: "FAQs", description: "Preguntas frecuentes por servicio", icon: FiHelpCircle, tone: "faqs" },
  { key: "settings", label: "Configuración", description: "Números de WhatsApp por idioma", icon: FiSettings, tone: "settings" }
] satisfies Array<{ key: AdminContentKey | "settings"; label: string; description: string; icon: IconType; tone: string }>;

// Secciones donde el orden de la lista controla el orden de render en el frontend.
const REORDERABLE_SECTIONS = new Set<AdminContentKey | "settings">(["boats", "boatCollections", "vehicles", "waterToys"]);

const defaultImage: MediaAsset = {
  src: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1200&q=80",
  alt: { es: "Imagen del contenido en Ibiza", en: "Content image in Ibiza" },
  source: "unsplash"
};

const blankImage: MediaAsset = { src: "", alt: { es: "", en: "", de: "", nl: "", ru: "" }, source: "local" };

const categorySlugsByCollection: Record<Boat["collectionId"], LocalizedText> = {
  "yachts-xl": { es: "yates-xl", en: "xl-yachts", de: "xl-yachten", nl: "xl-jachten", ru: "xl-yachts" },
  yachts: { es: "yates", en: "yachts", de: "yachten", nl: "jachten", ru: "yachts" },
  "fast-boats": { es: "embarcaciones-rapidas", en: "fast-boats", de: "schnellboote", nl: "snelle-boten", ru: "fast-boats" }
};

const requiredSaveLocales = ["es", "en"] as const satisfies Locale[];

const servicePageLabels: Record<ServicePageId, string> = {
  transfers: "Transfer",
  "water-toys": "Juguetes náuticos",
  security: "Seguridad",
  "self-drive": "Vehículos sin conductor",
  "water-taxi": "Taxi Boat",
  contact: "Contacto"
};

const optionDrivenServicePages = new Set<ServicePageId>(["security", "self-drive"]);

function getInitialSaveStatus(initialSource: "supabase" | "static", initialMessage?: string): AdminSaveStatus {
  if (initialSource === "supabase") {
    return {
      tone: "success",
      title: "Contenido conectado",
      message: initialMessage ?? "Contenido cargado desde Supabase."
    };
  }

  return {
    tone: "info",
    title: "Contenido local listo",
    message: initialMessage ?? "Contenido local listo. Pulsa \"Publicar en el sitio\" para sincronizar con la web."
  };
}

function getUnknownErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "No se pudo completar la accion.";
}

function getDirectLocalizedValue(value: LocalizedText, locale: Locale) {
  return String(value[locale] ?? "").trim();
}

function getPrimaryImage(item: { image: MediaAsset; gallery?: MediaAsset[] }) {
  return item.image.src.trim() ? item.image : item.gallery?.find((asset) => asset.src.trim());
}

function validateLocalizedSlug(
  errors: string[],
  slugKeys: Set<string>,
  label: string,
  slugsByLocale: LocalizedText,
  scope: string
) {
  requiredSaveLocales.forEach((saveLocale) => {
    const rawSlug = getDirectLocalizedValue(slugsByLocale, saveLocale);
    const slug = normalizeSlugSegment(rawSlug);

    if (!slug) {
      errors.push(`${label}: completa un slug valido ${saveLocale.toUpperCase()} con letras o numeros.`);
      return;
    }

    const slugKey = `${saveLocale}:${scope}:${slug.toLowerCase()}`;

    if (slugKeys.has(slugKey)) {
      errors.push(`${label}: el slug ${saveLocale.toUpperCase()} ya existe en esta seccion.`);
    }

    slugKeys.add(slugKey);
  });
}

function validatePrimaryImage(errors: string[], label: string, item: { image: MediaAsset; gallery?: MediaAsset[] }) {
  const primaryImage = getPrimaryImage(item);

  if (!primaryImage?.src.trim()) {
    errors.push(`${label}: sube o pega una imagen principal.`);
    return;
  }

  requiredSaveLocales.forEach((saveLocale) => {
    if (!getDirectLocalizedValue(primaryImage.alt, saveLocale)) {
      errors.push(`${label}: completa el alt ${saveLocale.toUpperCase()} de la imagen principal.`);
    }
  });
}

function validateSnapshotBeforeSave(snapshot: AdminContentSnapshot) {
  const errors: string[] = [];
  const collectionSlugKeys = new Set<string>();

  snapshot.content.boatCollections.forEach((collection, index) => {
    const label = getLocalizedValue(collection.title, "es").trim() || collection.id || `Colección ${index + 1}`;

    validateLocalizedSlug(errors, collectionSlugKeys, label, collection.slugsByLocale, "boatCollections");
    validatePrimaryImage(errors, label, collection);
  });

  const boatSlugKeys = new Set<string>();

  snapshot.content.boats.forEach((boat, index) => {
    const label = boat.name.trim() || boat.id || `Barco ${index + 1}`;

    if (!boat.name.trim() || boat.name.trim().toLowerCase() === "nuevo barco") {
      errors.push(`${label}: cambia el nombre visible antes de publicar.`);
    }

    if (!categorySlugsByCollection[boat.collectionId]) {
      errors.push(`${label}: selecciona una coleccion valida.`);
    }

    validateLocalizedSlug(errors, boatSlugKeys, label, boat.slugsByLocale, boat.collectionId);
    validatePrimaryImage(errors, label, boat);
  });

  const vehicleSlugKeys = new Set<string>();
  snapshot.content.vehicles.forEach((vehicle, index) => {
    const label = vehicle.name.trim() || vehicle.id || `Transfer ${index + 1}`;

    validateLocalizedSlug(errors, vehicleSlugKeys, label, vehicle.slugsByLocale, "vehicles");
    validatePrimaryImage(errors, label, vehicle);
  });

  const toySlugKeys = new Set<string>();
  snapshot.content.waterToys.forEach((toy, index) => {
    const label = getLocalizedValue(toy.name, "es").trim() || toy.id || `Juguete ${index + 1}`;

    validateLocalizedSlug(errors, toySlugKeys, label, toy.slugsByLocale, "waterToys");
    validatePrimaryImage(errors, label, toy);
  });

  const serviceSlugKeys = new Set<string>();
  const seenServicePageIds = new Set<ServicePageId>();
  snapshot.content.servicePages.forEach((page, index) => {
    const label = getLocalizedValue(page.title, "es").trim() || page.id || `Servicio ${index + 1}`;

    if (!isServicePageId(page.serviceId)) {
      errors.push(`${label}: el ID interno del servicio no es valido.`);
    } else {
      if (seenServicePageIds.has(page.serviceId)) {
        errors.push(`${label}: ya existe otra landing con el ID interno ${page.serviceId}.`);
      }

      seenServicePageIds.add(page.serviceId);
    }

    validateLocalizedSlug(errors, serviceSlugKeys, label, page.slugsByLocale, "servicePages");
    // Taxi Boat usa portada a pantalla completa; imagen de portada no es requerida
    const isTaxiBoat = page.serviceId === "water-taxi";
    if (!isTaxiBoat) {
      validatePrimaryImage(errors, label, page);
    }

    if (isServicePageId(page.serviceId) && optionDrivenServicePages.has(page.serviceId) && !(page.options?.length)) {
      errors.push(`${label}: agrega al menos una opcion visible para ${servicePageLabels[page.serviceId].toLowerCase()}.`);
    }

    page.options?.forEach((option, optionIndex) => {
      const optionLabel = getLocalizedValue(option.name, "es").trim() || option.id || `Opcion ${optionIndex + 1}`;

      validatePrimaryImage(errors, `${label} / ${optionLabel}`, option);
    });
  });

  snapshot.content.faqs.forEach((faq, index) => {
    const label = getLocalizedValue(faq.question, "es").trim() || faq.id || `FAQ ${index + 1}`;

    if (faq.serviceId && !isPublicServiceId(faq.serviceId)) {
      errors.push(`${label}: el servicio asociado ya no existe en el modelo público.`);
    }
  });

  if (errors.length <= 8) return errors;

  return [...errors.slice(0, 8), `Hay ${errors.length - 8} avisos mas. Corrige los primeros y pulsa publicar.`];
}

function getSuggestedAlt(baseAlt: LocalizedText, itemLabel: string, locale: Locale): LocalizedText {
  const label = itemLabel.trim();

  if (!label || label.toLowerCase() === "nuevo barco") return baseAlt;

  const es = baseAlt.es?.trim() || `${label} disponible para consultar en Ibiza`;
  const en = baseAlt.en?.trim() || `${label} available to enquire in Ibiza`;

  return {
    ...baseAlt,
    es,
    en,
    [locale]: getDirectLocalizedValue(baseAlt, locale) || (locale === "en" ? en : es)
  };
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

function localized(value: string): LocalizedText {
  return { es: value, en: value, de: value, nl: value };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function richTextFromPlainText(value: string) {
  const text = value.trim();

  return {
    html: text ? `<p>${escapeHtml(text)}</p>` : "",
    text
  };
}

function getRichTextValue(value: RichTextByLocale | undefined, locale: Locale, fallback?: LocalizedText) {
  return value?.[locale] ?? value?.es ?? (fallback ? richTextFromPlainText(getLocalizedValue(fallback, locale)) : { html: "", text: "" });
}

async function uploadRichTextImage(file: File, prefix: string): Promise<string> {
  const asset = await uploadAdminStorageFile(file, prefix);

  return asset.src;
}

function getUploadErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;

  if (error && typeof error === "object") {
    const storageError = error as { message?: string; error?: string; code?: string; statusCode?: string; status?: number };
    const parts = [storageError.message, storageError.error, storageError.code, storageError.statusCode, storageError.status ? `Status ${storageError.status}` : undefined].filter(Boolean);

    if (parts.length) return parts.join(" ");
  }

  return "No se pudo subir el archivo a Supabase Storage.";
}

async function readErrorResponse(response: Response) {
  try {
    const payload = await response.json() as { message?: string };
    if (payload.message) return payload.message;
  } catch {
    // Fall through to the status-based message.
  }

  return `No se pudo preparar la subida. HTTP ${response.status}.`;
}

async function getSignedUpload(file: File, prefix: string) {
  const response = await fetch("/admin/storage/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      prefix
    })
  });

  if (!response.ok) {
    throw new Error(await readErrorResponse(response));
  }

  return response.json() as Promise<{ path: string; token: string; publicUrl: string }>;
}

async function uploadAdminStorageFile(file: File, prefix: string): Promise<MediaAsset> {
  const signedUpload = await getSignedUpload(file, prefix);
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage.from(supabaseGalleryBucket).uploadToSignedUrl(signedUpload.path, signedUpload.token, file, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
    upsert: false
  });

  if (error) {
    throw new Error(`Supabase Storage rechazo el archivo firmado: ${getUploadErrorMessage(error)}`);
  }

  return {
    src: signedUpload.publicUrl,
    alt: localized(""),
    source: "supabase",
    storagePath: signedUpload.path
  };
}

function getItemTitle(item: AdminItem, locale: Locale) {
  if ("name" in item && typeof item.name === "string") return item.name;
  if ("name" in item && typeof item.name === "object") return getLocalizedValue(item.name, locale);
  if ("title" in item) return getLocalizedValue(item.title, locale);
  if ("question" in item) return getLocalizedValue(item.question, locale);
  return item.id;
}

function getItemDescription(item: AdminItem, locale: Locale) {
  if ("seoDescription" in item) {
    const seo = getLocalizedValue(item.seoDescription, locale);
    if (seo) return seo;
  }
  if ("description" in item && item.description) {
    const desc = item.description as Record<string, unknown>;
    if (typeof desc.es === "string" || typeof desc.en === "string") {
      return getLocalizedValue(item.description as LocalizedText, locale);
    }
    const localeVal = (desc[locale] ?? desc.es) as { text?: string } | undefined;
    if (localeVal?.text) return localeVal.text;
  }
  if ("answer" in item) return getLocalizedValue(item.answer, locale);
  return "";
}

function isGenericContentItem(item: AdminItem): item is GenericContentItem {
  return "kind" in item && item.kind === "boatCollection";
}

function touch<T extends AdminItem>(item: T): T {
  if ("updatedAt" in item) {
    return { ...item, updatedAt: new Date().toISOString().slice(0, 10) };
  }

  return item;
}

function snapshotFingerprint(snapshot: AdminContentSnapshot) {
  return JSON.stringify(snapshot.content);
}

function getServicePageHref(snapshot: AdminContentSnapshot, serviceId: FaqItem["serviceId"], locale: Locale) {
  const page = snapshot.content.servicePages.find((item) => item.serviceId === serviceId);
  return page ? `/${locale}/${getLocalizedSlug(page.slugsByLocale, locale)}` : null;
}

function isPublicServiceId(value: unknown): value is NonNullable<FaqItem["serviceId"]> {
  return typeof value === "string" && publicServiceIds.includes(value as ServiceId);
}

function isServicePageId(value: unknown): value is ServicePageId {
  return typeof value === "string" && servicePageIds.includes(value as ServicePageId);
}

function getVisitTarget(activeSection: AdminContentKey | "settings", item: AdminItem, snapshot: AdminContentSnapshot, locale: Locale) {
  if (activeSection === "boats" && "kind" in item && item.kind === "boat") {
    const collection = snapshot.content.boatCollections.find((collectionItem) => collectionItem.collectionId === item.collectionId);
    const categorySlugs = collection?.slugsByLocale ?? item.categorySlugsByLocale;

    return {
      href: `/${locale}/boat/${getLocalizedSlug(categorySlugs, locale)}/${getLocalizedSlug(item.slugsByLocale, locale)}`,
      label: "Ver barco"
    };
  }

  if ((activeSection === "boatCollections" || activeSection === "servicePages" || activeSection === "seoPages") && "slugsByLocale" in item) {
    return {
      href: `/${locale}/${getLocalizedSlug(item.slugsByLocale, locale)}`,
      label: "Ver página"
    };
  }

  if (activeSection === "vehicles" && "kind" in item && item.kind === "vehicle") {
    const sectionHref = getServicePageHref(snapshot, "transfers", locale) ?? `/${locale}/transfers`;

    return {
      href: `${sectionHref}/${getLocalizedSlug(item.slugsByLocale, locale)}`,
      label: "Ver vehículo"
    };
  }

  if (activeSection === "waterToys" && "kind" in item && item.kind === "waterToy") {
    const sectionHref = getServicePageHref(snapshot, "water-toys", locale) ?? `/${locale}/water-toys`;

    return {
      href: `${sectionHref}/${getLocalizedSlug(item.slugsByLocale, locale)}`,
      label: "Ver juguete"
    };
  }

  if (activeSection === "faqs" && "serviceId" in item && isPublicServiceId(item.serviceId)) {
    const href = getServicePageHref(snapshot, item.serviceId, locale);

    return href ? { href, label: "Ver servicio" } : null;
  }

  return null;
}

function createBoat(): Boat {
  const id = createId("boat");

  return {
    id,
    kind: "boat",
    name: "Nuevo barco",
    collectionId: "yachts",
    status: "published",
    visibility: "listed",
    robotsIndex: true,
    slugsByLocale: localized(id),
    categorySlugsByLocale: categorySlugsByCollection.yachts,
    image: defaultImage,
    gallery: [defaultImage],
    specs: [
      { icon: "cabins", label: { es: "Cabinas", en: "Cabins" }, value: { es: "3", en: "3" } },
      { icon: "length", label: { es: "Eslora", en: "Length" }, value: { es: "18 m", en: "18 m" } },
      { icon: "passengers", label: { es: "Pax", en: "Guests" }, value: { es: "12", en: "12" } },
      { icon: "bathrooms", label: { es: "Baños", en: "Bathrooms" }, value: { es: "2", en: "2" } }
    ],
    priceLabel: { es: "Consultar disponibilidad", en: "Check availability" },
    source: "mock",
    seoTitle: localized("Nuevo barco en Ibiza"),
    seoDescription: localized("Consulta disponibilidad de este barco privado en Ibiza."),
    publishedAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    schemaType: "Product",
    whatsappMessage: localized("Hola, quiero consultar disponibilidad de este barco en Ibiza.")
  };
}

function createBoatCollection(): BoatCollection {
  const id = createId("collection");
  const title = "Nueva colección";
  const date = new Date().toISOString().slice(0, 10);

  return {
    id,
    kind: "boatCollection",
    collectionId: "yachts",
    status: "published",
    visibility: "listed",
    robotsIndex: true,
    slugsByLocale: localized(id),
    title: localized(title),
    eyebrow: localized("Alquiler de barcos"),
    description: localized("Describe esta colección de barcos."),
    image: blankImage,
    countTarget: 0,
    hiddenPage: true,
    selectionNote: localized("Notas internas de selección."),
    seoTitle: localized(`${title} en Ibiza`),
    seoDescription: localized("Descripción SEO de la colección de barcos."),
    publishedAt: date,
    updatedAt: date,
    schemaType: "CollectionPage",
    whatsappMessage: localized("Hola, quiero consultar esta colección de barcos en Ibiza."),
    priceTag: localized(""),
    heroTitle: localized(""),
    descriptionBold: false,
    descriptionItalic: false,
    whatsappLabel: localized(""),
    hideWhatsappButton: false
  };
}

function createVehicle(): Vehicle {
  const id = createId("vehicle");
  const date = new Date().toISOString().slice(0, 10);

  return {
    id,
    kind: "vehicle",
    name: "Nuevo transfer",
    status: "published",
    visibility: "listed",
    robotsIndex: true,
    slugsByLocale: localized(id),
    image: blankImage,
    gallery: [],
    specs: [],
    overview: localized("Resumen breve para la tarjeta del transfer."),
    services: [],
    amenities: [],
    richDescription: {
      es: richTextFromPlainText("Descripción completa del transfer."),
      en: richTextFromPlainText("Full transfer description.")
    },
    marina: localized(""),
    priceLabel: localized("Consultar disponibilidad"),
    seoTitle: localized("Nuevo transfer en Ibiza"),
    seoDescription: localized("Descripción SEO del nuevo transfer en Ibiza."),
    publishedAt: date,
    updatedAt: date,
    schemaType: "Product",
    whatsappMessage: localized("Hola, quiero consultar disponibilidad de este transfer en Ibiza.")
  };
}

function createWaterToy(): WaterToy {
  const id = createId("water-toy");
  const date = new Date().toISOString().slice(0, 10);

  return {
    id,
    kind: "waterToy",
    status: "published",
    visibility: "listed",
    robotsIndex: true,
    slugsByLocale: localized(id),
    name: localized("Nuevo juguete náutico"),
    image: blankImage,
    gallery: [],
    description: localized("Resumen breve para la tarjeta del juguete náutico."),
    details: localized("Texto breve de ficha para el juguete náutico."),
    specs: [],
    amenities: [],
    richDescription: {
      es: richTextFromPlainText("Descripción completa del juguete náutico."),
      en: richTextFromPlainText("Full water toy description.")
    },
    marina: localized(""),
    priceLabel: localized("Consultar disponibilidad"),
    seoTitle: localized("Nuevo juguete náutico en Ibiza"),
    seoDescription: localized("Descripción SEO del nuevo juguete náutico en Ibiza."),
    publishedAt: date,
    updatedAt: date,
    schemaType: "Product",
    whatsappMessage: localized("Hola, quiero consultar disponibilidad de este juguete náutico en Ibiza.")
  };
}

function createServicePage(serviceId: ServicePageId = "transfers"): ServicePage {
  const id = createId("service");
  const date = new Date().toISOString().slice(0, 10);
  const title = servicePageLabels[serviceId];

  return {
    id,
    kind: "service",
    serviceId,
    status: "published",
    visibility: "listed",
    robotsIndex: true,
    slugsByLocale: localized(serviceId),
    title: localized(title),
    eyebrow: localized("Servicio personalizado"),
    description: localized("Resumen del servicio para el hero."),
    image: blankImage,
    gallery: [],
    specs: [],
    amenities: [],
    richDescription: {
      es: richTextFromPlainText("Descripción completa del servicio."),
      en: richTextFromPlainText("Full service description.")
    },
    marina: localized(""),
    priceLabel: localized("Consultar disponibilidad"),
    seoTitle: localized(`${title} en Ibiza`),
    seoDescription: localized(`Descripción SEO de ${title.toLowerCase()} en Ibiza.`),
    publishedAt: date,
    updatedAt: date,
    schemaType: "Service",
    whatsappMessage: localized("Hola, quiero consultar este servicio en Ibiza.")
  };
}

function createSeoPage(): SeoPage {
  const id = createId("seo");

  return {
    id,
    kind: "seoPage",
    status: "published",
    visibility: "hidden",
    robotsIndex: true,
    slugsByLocale: localized(id),
    title: localized("Nueva página SEO"),
    eyebrow: localized("Página SEO oculta"),
    excerpt: localized("Resumen breve pensado para posicionamiento y vista previa."),
    body: {
      es: { html: "<h2>Nuevo contenido SEO</h2><p>Escribe aquí la página con enlaces, imágenes y secciones.</p>", text: "Nuevo contenido SEO" },
      en: { html: "<h2>New SEO content</h2><p>Write the page here with links, images and sections.</p>", text: "New SEO content" }
    },
    image: defaultImage,
    gallery: [],
    seoTitle: localized("Nueva página SEO en Ibiza"),
    seoDescription: localized("Descripción SEO de la nueva página oculta del menú."),
    publishedAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    schemaType: "Article"
  };
}

function createFaq(): FaqItem {
  const id = createId("faq");

  return {
    id,
    serviceId: "boats",
    question: localized("Nueva pregunta frecuente"),
    answer: localized("Escribe la respuesta.")
  };
}

function createItemForSection(section: AdminContentKey): AdminItem {
  switch (section) {
    case "boats":
      return createBoat();
    case "boatCollections":
      return createBoatCollection();
    case "vehicles":
      return createVehicle();
    case "waterToys":
      return createWaterToy();
    case "servicePages":
      return createServicePage();
    case "seoPages":
      return createSeoPage();
    case "faqs":
      return createFaq();
  }
}

interface AdminDashboardProps {
  initialSnapshot: AdminContentSnapshot;
  initialSource: "supabase" | "static";
  initialMessage?: string;
  adminEmail: string;
  saveSnapshotAction: (snapshot: AdminContentSnapshot) => Promise<AdminMutationResult>;
  signOutAction: () => Promise<void>;
  initialSettings: SiteSettings;
  saveSettingsAction: (settings: SiteSettings) => Promise<AdminMutationResult>;
}

interface SortableAdminListItemProps {
  item: AdminItem;
  locale: Locale;
  activeSection: AdminContentKey | "settings";
  isActive: boolean;
  reorderable: boolean;
  isFirst: boolean;
  isLast: boolean;
  visitTarget: { href: string } | null | undefined;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onVisitGuard: () => boolean;
}

function SortableAdminListItem({ item, locale, activeSection, isActive, reorderable, isFirst, isLast, visitTarget, onSelect, onMoveUp, onMoveDown, onVisitGuard }: SortableAdminListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled: !reorderable });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const description = getItemDescription(item, locale);

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`admin-list-item ${isActive ? "is-active" : ""} ${isDragging ? "is-dragging" : ""}`}
    >
      {reorderable && (
        <span
          className="admin-list-item__grip"
          {...attributes}
          {...listeners}
          title="Arrastra para reordenar"
          aria-label="Arrastra para reordenar"
        >
          <FiMove aria-hidden="true" />
        </span>
      )}
      <button type="button" className="admin-list-item__select" onClick={onSelect}>
        <span className="admin-list-item__body">
          <span className="admin-list-item__title">{getItemTitle(item, locale)}</span>
          {description ? <small>{description}</small> : null}

          {activeSection !== "faqs" && (
            <span className="admin-list__badges">
              {"collectionId" in item && (
                <span className="admin-visibility-badge" style={{ backgroundColor: "#f1f5f9", color: "#475569", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", fontSize: "12px" }}>
                  {item.collectionId === "yachts-xl" ? "Yates XL" : item.collectionId === "yachts" ? "Yates" : "Rápidas"}
                </span>
              )}
              {"visibility" in item && (
                <span className={`admin-status-badge admin-status-badge--${item.visibility === "hidden" ? "hidden" : "published"}`} style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "12px" }}>
                  {item.visibility === "hidden" ? "Oculto" : "Visible"}
                </span>
              )}
            </span>
          )}
        </span>
      </button>
      <div className="admin-list-item__aside">
        {reorderable && (
          <div className="admin-list-item__order">
            <button type="button" onClick={onMoveUp} disabled={isFirst} aria-label="Subir" title="Subir">
              <FiChevronUp aria-hidden="true" />
            </button>
            <button type="button" onClick={onMoveDown} disabled={isLast} aria-label="Bajar" title="Bajar">
              <FiChevronDown aria-hidden="true" />
            </button>
          </div>
        )}
        {visitTarget ? (
          <button
            type="button"
            className="admin-list-item__visit"
            title="Ver página pública"
            aria-label="Ver página pública"
            onClick={() => {
              if (onVisitGuard()) {
                window.open(visitTarget.href, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <FiExternalLink aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function AdminDashboard({ initialSnapshot, initialSource, initialMessage, adminEmail, saveSnapshotAction, signOutAction, initialSettings, saveSettingsAction }: AdminDashboardProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [lastSavedFingerprint, setLastSavedFingerprint] = useState(() => snapshotFingerprint(initialSnapshot));
  const [lastSavedSettingsFingerprint, setLastSavedSettingsFingerprint] = useState(() => JSON.stringify(initialSettings));
  const [settings, setSettings] = useState(initialSettings);
  const [activeSection, setActiveSection] = useState<AdminContentKey | "settings">("boats");
  const [selectedId, setSelectedId] = useState(initialSnapshot.content.boats[0]?.id ?? "");
  const [mobileView, setMobileView] = useState<"list" | "editor">("list");
  const [locale, setLocale] = useState<Locale>("es");
  const [query, setQuery] = useState("");
  const [filterCollection, setFilterCollection] = useState<string>("all");
  const [filterVisibility, setFilterVisibility] = useState<string>("all");
  const [navOpen, setNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-sidebar-collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const [saveStatus, setSaveStatus] = useState<AdminSaveStatus>(() => getInitialSaveStatus(initialSource, initialMessage));

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const [isSaving, setIsSaving] = useState(false);
  const saveStatusRef = useRef<HTMLDivElement>(null);
  const logoutFormRef = useRef<HTMLFormElement>(null);

  // Estados para controlar el progreso de traducción por idioma
  const [translationStatus, setTranslationStatus] = useState<Record<Locale, "pending" | "translating" | "completed" | "error"> | null>(null);
  const [translationErrors, setTranslationErrors] = useState<Record<Locale, string>>({} as Record<Locale, string>);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationSourceLocale, setTranslationSourceLocale] = useState<Locale | null>(null);

  // Estados para el modal de confirmación de traducción
  const [translationConfirmOpen, setTranslationConfirmOpen] = useState(false);
  const [translationConfirmVisible, setTranslationConfirmVisible] = useState(false);

  function clearTranslationStates() {
    setTranslationStatus(null);
    setTranslationErrors({} as Record<Locale, string>);
    setTranslationSourceLocale(null);
  }

  function openTranslationConfirm() {
    setTranslationConfirmOpen(true);
    setTimeout(() => setTranslationConfirmVisible(true), 10);
  }

  function closeTranslationConfirm() {
    setTranslationConfirmVisible(false);
    setTimeout(() => setTranslationConfirmOpen(false), 280);
  }

  // Helper para buscar locales con traducciones faltantes en el item
  function findMissingLocales(item: AdminItem, sourceLocale: Locale): Locale[] {
    const targetLocales = locales.filter(loc => loc !== sourceLocale);
    const missing = new Set<Locale>();

    function check(obj: any) {
      if (obj === null || obj === undefined) return;
      if (Array.isArray(obj)) {
        obj.forEach(check);
        return;
      }
      if (typeof obj === "object") {
        // LocalizedText
        const isLocalizedTextObj = typeof obj.es === "string" || typeof obj.en === "string";
        if (isLocalizedTextObj) {
          const sourceVal = obj[sourceLocale];
          if (typeof sourceVal === "string" && sourceVal.trim() !== "") {
            targetLocales.forEach(loc => {
              const targetVal = obj[loc];
              if (typeof targetVal !== "string" || targetVal.trim() === "") {
                missing.add(loc);
              }
            });
          }
          return;
        }

        // RichTextByLocale
        const isRichTextObj =
          (obj.es && typeof obj.es.html === "string") ||
          (obj.en && typeof obj.en.html === "string") ||
          (obj.de && typeof obj.de.html === "string") ||
          (obj.nl && typeof obj.nl.html === "string");
        if (isRichTextObj) {
          const sourceVal = obj[sourceLocale];
          if (sourceVal && typeof sourceVal.html === "string" && sourceVal.html.trim() !== "") {
            targetLocales.forEach(loc => {
              const targetVal = obj[loc];
              if (!targetVal || typeof targetVal.html !== "string" || targetVal.html.trim() === "") {
                missing.add(loc);
              }
            });
          }
          return;
        }

        Object.keys(obj).forEach(key => {
          if (["id", "status", "visibility", "publishedAt", "updatedAt", "source", "collectionId", "serviceId", "kind"].includes(key)) return;
          check(obj[key]);
        });
      }
    }

    check(item);
    return Array.from(missing);
  }

  // Combinar recursivamente los datos de un idioma destino traducidos con el item actual
  function mergeLocaleData(current: any, translated: any, targetLocale: Locale): any {
    if (translated === null || translated === undefined) {
      return current;
    }
    if (current === null || current === undefined) {
      current = Array.isArray(translated) ? [] : typeof translated === "object" ? {} : translated;
    }
    if (Array.isArray(current) && Array.isArray(translated)) {
      // Ajustar longitud del array si difiere (ej. nuevas especificaciones o fotos añadidas)
      const maxLength = Math.max(current.length, translated.length);
      const result = [];
      for (let i = 0; i < maxLength; i++) {
        result.push(mergeLocaleData(current[i], translated[i], targetLocale));
      }
      return result;
    }
    if (typeof current === "object" && typeof translated === "object") {
      const isLocalizedTextObj = typeof current.es === "string" || typeof current.en === "string" || typeof translated.es === "string" || typeof translated.en === "string";
      const isRichTextObj =
        (current.es && typeof current.es.html === "string") ||
        (current.en && typeof current.en.html === "string") ||
        (translated.es && typeof translated.es.html === "string") ||
        (translated.en && typeof translated.en.html === "string");

      if (isLocalizedTextObj) {
        return {
          ...current,
          [targetLocale]: translated[targetLocale] !== undefined ? translated[targetLocale] : current[targetLocale]
        };
      }
      if (isRichTextObj) {
        return {
          ...current,
          [targetLocale]: translated[targetLocale] !== undefined ? translated[targetLocale] : current[targetLocale]
        };
      }
      const merged: any = {};
      const allKeys = new Set([...Object.keys(current), ...Object.keys(translated)]);
      for (const key of allKeys) {
        merged[key] = mergeLocaleData(current[key], translated[key], targetLocale);
      }
      return merged;
    }
    return current;
  }

  // Ejecuta la traducción en paralelo por idioma
  async function runTranslation(
    itemToTranslate: AdminItem,
    sourceLocale: Locale,
    targetLocales: Locale[],
    onFinish?: (finalItem: AdminItem) => void
  ) {
    if (!itemToTranslate || targetLocales.length === 0) {
      if (onFinish) onFinish(itemToTranslate);
      return;
    }

    setIsTranslating(true);
    setTranslationSourceLocale(sourceLocale);
    setTranslationErrors({} as Record<Locale, string>);

    const initialStatus = {} as Record<Locale, "pending" | "translating" | "completed" | "error">;
    locales.forEach(loc => {
      if (loc !== sourceLocale) {
        initialStatus[loc] = targetLocales.includes(loc) ? "pending" : "completed";
      }
    });
    setTranslationStatus(initialStatus);

    let currentItemAccumulator = structuredClone(itemToTranslate) as AdminItem;

    const translationPromises = targetLocales.map(async (targetLocale) => {
      setTranslationStatus(prev => ({ ...prev!, [targetLocale]: "translating" }));
      try {
        const result = await translateItemAction(itemToTranslate, sourceLocale, targetLocale);
        if (result.ok && result.item) {
          setTranslationStatus(prev => ({ ...prev!, [targetLocale]: "completed" }));
          currentItemAccumulator = mergeLocaleData(currentItemAccumulator, result.item, targetLocale);
        } else {
          setTranslationStatus(prev => ({ ...prev!, [targetLocale]: "error" }));
          setTranslationErrors(prev => ({ ...prev, [targetLocale]: result.message || "Error de traducción." }));
        }
      } catch (err) {
        setTranslationStatus(prev => ({ ...prev!, [targetLocale]: "error" }));
        setTranslationErrors(prev => ({ ...prev, [targetLocale]: err instanceof Error ? err.message : "Fallo de conexión." }));
      }
    });

    await Promise.all(translationPromises);

    updateSnapshot(activeSection as AdminContentKey, (currentItems) => currentItems.map((item) => (item.id === itemToTranslate.id ? touch(currentItemAccumulator) : item)));
    setIsTranslating(false);

    if (onFinish) {
      onFinish(currentItemAccumulator);
    }
  }

  function hasAnyTranslation(item: AdminItem, targetLocales: Locale[]): boolean {
    let found = false;

    function check(obj: any) {
      if (found) return;
      if (obj === null || obj === undefined) return;
      if (Array.isArray(obj)) {
        obj.forEach(check);
        return;
      }
      if (typeof obj === "object") {
        // LocalizedText
        const isLocalizedTextObj = typeof obj.es === "string" || typeof obj.en === "string";
        if (isLocalizedTextObj) {
          for (const loc of targetLocales) {
            const val = obj[loc];
            if (typeof val === "string" && val.trim() !== "") {
              found = true;
              return;
            }
          }
          return;
        }

        // RichTextByLocale
        const isRichTextObj =
          (obj.es && typeof obj.es.html === "string") ||
          (obj.en && typeof obj.en.html === "string") ||
          (obj.de && typeof obj.de.html === "string") ||
          (obj.nl && typeof obj.nl.html === "string");
        if (isRichTextObj) {
          for (const loc of targetLocales) {
            const val = obj[loc];
            if (val && typeof val.html === "string" && val.html.trim() !== "") {
              found = true;
              return;
            }
          }
          return;
        }

        Object.keys(obj).forEach(key => {
          if (["id", "status", "visibility", "publishedAt", "updatedAt", "source", "collectionId", "serviceId", "kind"].includes(key)) return;
          check(obj[key]);
        });
      }
    }

    check(item);
    return found;
  }

  function handleConfirmTranslation() {
    if (!selectedItem) return;
    const targetLocales = locales.filter(loc => loc !== locale);
    closeTranslationConfirm();
    void runTranslation(selectedItem, locale, targetLocales);
  }

  function translateCurrentItemManually() {
    if (!selectedItem) return;
    const targetLocales = locales.filter(loc => loc !== locale);
    
    if (hasAnyTranslation(selectedItem, targetLocales)) {
      openTranslationConfirm();
    } else {
      void runTranslation(selectedItem, locale, targetLocales);
    }
  }

  const section = sectionConfig.find((item) => item.key === activeSection) ?? sectionConfig[0];
  const SectionIcon = section.icon;
  const items = activeSection === "settings" ? [] : (snapshot.content[activeSection] as AdminItem[]);
  const filteredItems = activeSection === "settings" ? [] : items.filter((item) => {
    const title = getItemTitle(item, locale).toLowerCase();
    const id = item.id.toLowerCase();
    const slug = "slugsByLocale" in item ? getLocalizedValue(item.slugsByLocale, locale).toLowerCase() : "";
    const matchesQuery = `${title} ${id} ${slug}`.includes(query.toLowerCase());

    if (!matchesQuery) return false;

    if (activeSection === "boats" && filterCollection !== "all") {
      if (!("collectionId" in item) || item.collectionId !== filterCollection) {
        return false;
      }
    }

    if (activeSection !== "faqs" && filterVisibility !== "all") {
      if ("visibility" in item) {
        if (filterVisibility === "listed" && item.visibility !== "listed") return false;
        if (filterVisibility === "hidden" && item.visibility !== "hidden") return false;
      }
    }

    return true;
  });
  const canReorder = REORDERABLE_SECTIONS.has(activeSection) && query.trim() === "";
  const selectedItem = filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? items.find((item) => item.id === selectedId) ?? items[0];
  const visitTarget = selectedItem ? getVisitTarget(activeSection, selectedItem, snapshot, locale) : null;
  const SaveStatusIcon = isSaving ? FiLoader : saveStatus.tone === "success" ? FiCheckCircle : saveStatus.tone === "error" ? FiAlertCircle : FiSave;
  const currentFingerprint = useMemo(() => snapshotFingerprint(snapshot), [snapshot]);
  const currentSettingsFingerprint = useMemo(() => JSON.stringify(settings), [settings]);
  const hasUnsavedSnapshotChanges = currentFingerprint !== lastSavedFingerprint;
  const hasUnsavedSettingsChanges = currentSettingsFingerprint !== lastSavedSettingsFingerprint;
  const hasUnsavedChanges = hasUnsavedSnapshotChanges || hasUnsavedSettingsChanges;
  const headerSaveLabel = isSaving ? "Guardando" : hasUnsavedChanges ? "Guardar" : "Guardado";
  const editorSaveLabel = isSaving ? "Guardando" : hasUnsavedChanges ? "Guardar cambios" : "Todo guardado";

  useEffect(() => {
    if (saveStatus.tone === "error") {
      saveStatusRef.current?.focus();
    }
  }, [saveStatus]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const counters = useMemo(() => {
    const content = snapshot.content;

    switch (activeSection) {
      case "boats": {
        const boats = content.boats;
        const indexable = boats.filter(b => b.robotsIndex).length;
        const visible = boats.filter(b => b.visibility !== "hidden").length;
        const images = boats.flatMap(b => [b.image, ...b.gallery]).filter(img => img?.src?.trim()).length;
        return [
          { label: "Barcos Totales", value: boats.length, note: "rutas de yates" },
          { label: "Indexables", value: indexable, note: "en motores de búsqueda" },
          { label: "Visibles en la web", value: visible, note: "públicamente listados" },
          { label: "Imágenes del Catálogo", value: images, note: "fotos y galerías de barcos" }
        ];
      }
      case "boatCollections": {
        const collections = content.boatCollections;
        const indexable = collections.filter(c => c.robotsIndex).length;
        const hidden = collections.filter(c => c.hiddenPage).length;
        const visible = collections.length - hidden;
        return [
          { label: "Colecciones", value: collections.length, note: "categorías de barcos" },
          { label: "Indexables", value: indexable, note: "en sitemap público" },
          { label: "Páginas del menú", value: visible, note: "visibles en la navegación" },
          { label: "Páginas de filtro", value: hidden, note: "categorías para búsquedas" }
        ];
      }
      case "vehicles": {
        const vehicles = content.vehicles;
        const visible = vehicles.filter(v => v.visibility !== "hidden").length;
        const specs = vehicles.flatMap(v => v.specs ?? []).length;
        const images = vehicles.flatMap(v => [v.image, ...(v.gallery ?? [])]).filter(img => img?.src?.trim()).length;
        return [
          { label: "Vehículos Transfer", value: vehicles.length, note: "traslados y choferes" },
          { label: "Visibles", value: visible, note: "en la página de transfer" },
          { label: "Características", value: specs, note: "especificaciones cargadas" },
          { label: "Imágenes de Galería", value: images, note: "fotos de transfers" }
        ];
      }
      case "waterToys": {
        const toys = content.waterToys;
        const visible = toys.filter(t => t.visibility !== "hidden").length;
        const richDesc = toys.filter(t => t.richDescription?.es?.html || t.richDescription?.en?.html).length;
        const images = toys.flatMap(t => [t.image, ...(t.gallery ?? [])]).filter(img => img?.src?.trim()).length;
        return [
          { label: "Juguetes Náuticos", value: toys.length, note: "catálogo de juguetes" },
          { label: "Disponibles", value: visible, note: "visibles en la web" },
          { label: "Con descripción larga", value: richDesc, note: "detallados con editor" },
          { label: "Imágenes cargadas", value: images, note: "galerías de juguetes" }
        ];
      }
      case "servicePages": {
        const pages = content.servicePages;
        const options = pages.flatMap(p => p.options ?? []).length;
        const indexable = pages.filter(p => p.robotsIndex).length;
        const images = pages.flatMap(p => [p.image, ...(p.gallery ?? [])]).filter(img => img?.src?.trim()).length;
        return [
          { label: "Landings de Servicio", value: pages.length, note: "páginas de servicios" },
          { label: "Opciones de Servicio", value: options, note: "bloques internos" },
          { label: "Indexables", value: indexable, note: "en buscadores" },
          { label: "Imágenes de Servicios", value: images, note: "en secciones y cabeceras" }
        ];
      }
      case "seoPages": {
        const seo = content.seoPages;
        const indexable = seo.filter(p => p.robotsIndex).length;
        const published = seo.filter(p => p.status === "published").length;
        const images = seo.flatMap(p => [p.image, ...p.gallery]).filter(img => img?.src?.trim()).length;
        return [
          { label: "Páginas SEO", value: seo.length, note: "fuera del menú principal" },
          { label: "Indexables (Robots)", value: indexable, note: "rastreables por Google" },
          { label: "Páginas Publicadas", value: published, note: "activas en el sitio" },
          { label: "Imágenes de Artículo", value: images, note: "recursos visuales SEO" }
        ];
      }
      case "faqs": {
        const faqs = content.faqs;
        const boatsFaqs = faqs.filter(f => f.serviceId === "boats").length;
        const transfersFaqs = faqs.filter(f => f.serviceId === "transfers").length;
        const toysFaqs = faqs.filter(f => f.serviceId === "water-toys").length;
        return [
          { label: "FAQs Totales", value: faqs.length, note: "preguntas frecuentes" },
          { label: "FAQs de Barcos", value: boatsFaqs, note: "asociadas a navegación" },
          { label: "FAQs de Transfers", value: transfersFaqs, note: "asociadas a traslados" },
          { label: "FAQs de Juguetes", value: toysFaqs, note: "asociadas a juguetes" }
        ];
      }
      case "settings":
      default: {
        const totalItems = content.boats.length + content.boatCollections.length + content.vehicles.length + content.waterToys.length + content.servicePages.length + content.seoPages.length + content.faqs.length;
        const mediaCount = [
          ...content.boats.flatMap((item) => [item.image, ...item.gallery]),
          ...content.vehicles.flatMap((item) => [item.image, ...item.gallery]),
          ...content.waterToys.flatMap((item) => [item.image, ...item.gallery]),
          ...content.servicePages.flatMap((item) => [item.image, ...(item.gallery ?? [])]),
          ...content.seoPages.flatMap((item) => [item.image, ...item.gallery])
        ].filter(img => img?.src?.trim()).length;
        const activeWhatsApp = locales.length;
        return [
          { label: "Total Contenido", value: totalItems, note: "registros en la base de datos" },
          { label: "Imágenes del Sitio", value: mediaCount, note: "recursos de galería activos" },
          { label: "Idiomas del Sistema", value: locales.length, note: "ES, EN, DE, NL, RU" },
          { label: "WhatsApp Activos", value: activeWhatsApp, note: "canales de chat directos" }
        ];
      }
    }
  }, [snapshot, activeSection]);

  function confirmDiscardUnsavedChanges() {
    if (!hasUnsavedChanges) return true;

    return window.confirm("Tienes cambios sin guardar. Si sales ahora, se perderan. ¿Quieres continuar sin guardar?");
  }

  function selectSection(key: AdminContentKey | "settings") {
    clearTranslationStates();
    setNavOpen(false);
    if (key === "settings") {
      setActiveSection(key);
      setSelectedId("");
      setMobileView("list");
      setQuery("");
      setFilterCollection("all");
      setFilterVisibility("all");
      return;
    }
    const nextItems = snapshot.content[key] as AdminItem[];
    setActiveSection(key);
    setSelectedId(nextItems[0]?.id ?? "");
    setMobileView("list");
    setQuery("");
    setFilterCollection("all");
    setFilterVisibility("all");
  }

  function selectItem(id: string) {
    clearTranslationStates();
    setSelectedId(id);
    setMobileView("editor");
  }

  function updateSnapshot(key: AdminContentKey, updater: (items: AdminItem[]) => AdminItem[]) {
    setSnapshot((current) => ({
      ...current,
      exportedAt: new Date().toISOString(),
      content: {
        ...current.content,
        [key]: updater(current.content[key] as AdminItem[]) as never
      }
    }));
  }

  function updateSelectedItem(patch: Partial<AdminItem>) {
    if (!selectedItem) return;

    updateSnapshot(activeSection as AdminContentKey, (currentItems) => currentItems.map((item) => (item.id === selectedItem.id ? touch({ ...item, ...patch } as AdminItem) : item)));
  }

  // Reordena el array completo moviendo `sourceId` a la posición de `targetId`.
  // Opera por ID sobre el array completo (no la vista filtrada) para que el orden
  // relativo sea correcto incluso con filtros de colección/visibilidad activos.
  function reorderItems(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    updateSnapshot(activeSection as AdminContentKey, (currentItems) => {
      const from = currentItems.findIndex((item) => item.id === sourceId);
      const to = currentItems.findIndex((item) => item.id === targetId);
      if (from < 0 || to < 0) return currentItems;
      const next = [...currentItems];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  // Mueve un item una posición arriba (-1) o abajo (+1) intercambiando con su vecino
  // dentro de la vista filtrada actual (botones ↑/↓, compatibles con táctil).
  function moveItem(itemId: string, direction: -1 | 1) {
    const visibleIndex = filteredItems.findIndex((item) => item.id === itemId);
    const neighbor = filteredItems[visibleIndex + direction];
    if (visibleIndex < 0 || !neighbor) return;
    reorderItems(itemId, neighbor.id);
  }

  // Fin de arrastre con @dnd-kit: reordena el array completo por ID.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderItems(String(active.id), String(over.id));
    }
  }

  function normalizeItemForActiveSection(item: AdminItem) {
    const normalized = normalizeAdminContentSnapshot({
      ...snapshot,
      content: {
        ...snapshot.content,
        [activeSection as AdminContentKey]: [item] as never
      }
    });

    return (normalized.content[activeSection as AdminContentKey] as AdminItem[])[0];
  }

  function addItem() {
    if (activeSection === "settings") return;
    if (activeSection === "servicePages") {
      const usedServicePageIds = new Set(snapshot.content.servicePages.map((page) => page.serviceId));
      const nextServicePageId = servicePageIds.find((serviceId) => !usedServicePageIds.has(serviceId));

      if (!nextServicePageId) {
        setSaveStatus({
          tone: "error",
          title: "No hay más landings base disponibles",
          message: "Las páginas de servicio usan una lista cerrada de IDs internos. Edita una landing existente en lugar de crear otra."
        });
        return;
      }

      const newPage = normalizeItemForActiveSection(createServicePage(nextServicePageId));

      updateSnapshot(activeSection as AdminContentKey, (currentItems) => [newPage as AdminItem, ...currentItems]);
      selectItem(newPage.id);
      setSaveStatus({
        tone: "info",
        title: "Landing creada en memoria",
        message: "Completa los campos clave y pulsa \"Publicar en el sitio\"."
      });
      return;
    }

    const newItem = normalizeItemForActiveSection(createItemForSection(activeSection as AdminContentKey));

    updateSnapshot(activeSection as AdminContentKey, (currentItems) => [newItem as AdminItem, ...currentItems]);
    selectItem(newItem.id);
    setSaveStatus({
      tone: "info",
      title: "Contenido creado en memoria",
      message: "Completa los campos clave y pulsa \"Publicar en el sitio\"."
    });
  }

  function duplicateItem() {
    if (!selectedItem) return;

    const copy = touch(normalizeItemForActiveSection({ ...selectedItem, id: createId(activeSection) } as AdminItem));
    updateSnapshot(activeSection as AdminContentKey, (currentItems) => [copy, ...currentItems]);
    selectItem(copy.id);
    setSaveStatus({
      tone: "info",
      title: "Contenido duplicado en memoria",
      message: "Revisa slug, imagen y textos antes de publicar."
    });
  }

  function deleteItem() {
    if (!selectedItem) return;

    if (!window.confirm(`Eliminar "${getItemTitle(selectedItem, locale)}"? Pulsa "Publicar en el sitio" después para aplicar el borrado en la web.`)) {
      return;
    }

    clearTranslationStates();
    const nextItems = items.filter((item) => item.id !== selectedItem.id);

    updateSnapshot(activeSection as AdminContentKey, () => nextItems);
    setSelectedId(nextItems[0]?.id ?? "");
    setMobileView("list");
    setSaveStatus({
      tone: "info",
      title: "Contenido eliminado en memoria",
      message: "Pulsa \"Publicar en el sitio\" para aplicar el borrado en la web pública."
    });
  }

  async function saveToSupabase() {
    if (isSaving || isTranslating) return;

    if (activeSection === "settings") {
      await handleSaveSettings();
      return;
    }

    const validationErrors = validateSnapshotBeforeSave(snapshot);

    if (validationErrors.length) {
      setSaveStatus({
        tone: "error",
        title: "Revisa antes de guardar",
        message: "No envie cambios a Supabase porque hay datos clave incompletos.",
        details: validationErrors
      });
      return;
    }

    // Guardar directamente (desenlazado de la traducción automática)
    await proceedWithSave(snapshot);
  }

  async function proceedWithSave(snapshotToSave: AdminContentSnapshot) {
    setIsSaving(true);
    setSaveStatus({
      tone: "info",
      title: "Publicando en el sitio",
      message: "Publicando todos los cambios, galerías y textos para que la web pública los use."
    });

    try {
      const result = await saveSnapshotAction(snapshotToSave);

      setSaveStatus({
        tone: result.ok ? "success" : "error",
        title: result.ok ? "Publicado en el sitio" : "No se pudo publicar",
        message: result.message,
        details: result.details
      });

      if (result.ok && result.snapshot) {
        setSnapshot(result.snapshot);
        setLastSavedFingerprint(snapshotFingerprint(result.snapshot));
      }
    } catch (error) {
      setSaveStatus({
        tone: "error",
        title: "No se pudo guardar",
        message: getUnknownErrorMessage(error)
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveSettings() {
    if (isSaving) return;
    setIsSaving(true);
    setSaveStatus({
      tone: "info",
      title: "Guardando configuración",
      message: "Publicando números de WhatsApp en el sitio..."
    });
    try {
      const result = await saveSettingsAction(settings);
      if (result.ok) {
        setLastSavedSettingsFingerprint(JSON.stringify(settings));
        setSaveStatus({
          tone: "success",
          title: "Configuración guardada",
          message: result.message,
          details: result.details
        });
      } else {
        setSaveStatus({
          tone: "error",
          title: "No se pudo guardar",
          message: result.message,
          details: result.details
        });
      }
    } catch (error) {
      setSaveStatus({
        tone: "error",
        title: "No se pudo guardar",
        message: getUnknownErrorMessage(error)
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={`admin-shell ${navOpen ? "admin-shell--nav-open" : ""} ${sidebarCollapsed ? "admin-shell--sidebar-collapsed" : ""}`}>
      {navOpen ? <div className="admin-drawer-backdrop" onClick={() => setNavOpen(false)} aria-hidden="true" /> : null}
      <aside className={`admin-sidebar ${navOpen ? "is-open" : ""} ${sidebarCollapsed ? "is-collapsed" : ""}`} aria-label="Secciones del administrador">
        <div className="admin-sidebar__brand">
          <div style={{ display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "space-between", width: "100%" }}>
            {!sidebarCollapsed && (
              <div className="admin-sidebar__brand-text" style={{ display: "grid", gap: "2px", lineHeight: "1" }}>
                <span style={{ color: "var(--color-accent-soft)", fontSize: "12px", fontWeight: 900 }}>FAST</span>
                <strong style={{ fontFamily: "var(--font-marcellus), serif", fontSize: "24px", fontWeight: 400 }}>Admin</strong>
              </div>
            )}
            <button
              type="button"
              className="admin-sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
              aria-label={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              <FiChevronLeft style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }} />
            </button>
          </div>
        </div>
        <nav className="admin-sidebar__nav">
          {sectionConfig.map((item) => {
            const ItemIcon = item.icon;

            return (
              <button type="button" key={item.key} className={item.key === activeSection ? "is-active" : ""} onClick={() => selectSection(item.key)}>
                <span className={`admin-section-icon admin-section-icon--${item.tone}`}>
                  <ItemIcon aria-hidden="true" />
                </span>
                <span className="admin-section-copy">
                  <span>{item.label}</span>
                  <small>{item.description}</small>
                </span>
              </button>
            );
          })}
        </nav>
        <form
          ref={logoutFormRef}
          action={signOutAction}
          className="admin-sidebar__logout"
        >
          <button
            type="button"
            className="admin-sidebar__logout-button"
            onClick={() => {
              if (confirmDiscardUnsavedChanges()) {
                logoutFormRef.current?.submit();
              }
            }}
          >
            <FiLogOut aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </form>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-nav-toggle" onClick={() => setNavOpen(true)} aria-label="Abrir menú de secciones">
            <FiMenu aria-hidden="true" />
          </button>
          <div className="admin-header-title">
            <p className="admin-kicker">Panel preparado para Supabase</p>
            <h1>Administrador</h1>
            <span className="admin-title-subtitle">de contenido</span>
          </div>
        </header>

        <section className="admin-kpis" aria-label="Resumen del contenido">
          {counters.map((counter) => (
            <article key={counter.label} className="admin-kpi">
              <span>{counter.label}</span>
              <strong>{counter.value}</strong>
              <small>{counter.note}</small>
            </article>
          ))}
        </section>

        <section className={`admin-workspace admin-workspace--${section.tone} admin-workspace--show-${mobileView}`}>
          {activeSection !== "settings" && (
            <div className="admin-list-panel">
              <div className="admin-panel-heading">
                <span className="admin-heading-icon">
                  <SectionIcon aria-hidden="true" />
                </span>
                <div>
                  <h2>{section.label}</h2>
                </div>
                <button type="button" className="admin-icon-button" onClick={addItem} aria-label="Crear contenido">
                  <FiPlus aria-hidden="true" />
                </button>
              </div>
              <label className="admin-search">
                <FiSearch aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título o ID" />
              </label>
              
              {/* Panel de Filtros rápidos */}
              {activeSection !== "faqs" && (
                <div className="admin-list-filters">
                  {activeSection === "boats" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Colección</span>
                      <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
                        {[
                          { key: "all", label: "Todas" },
                          { key: "yachts-xl", label: "Yates XL" },
                          { key: "yachts", label: "Yates" },
                          { key: "fast-boats", label: "Rápidas" }
                        ].map((col) => (
                          <button
                            type="button"
                            key={col.key}
                            onClick={() => setFilterCollection(col.key)}
                            style={{
                              padding: "5px 11px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: 800,
                              border: "1px solid",
                              borderColor: filterCollection === col.key ? "var(--admin-section-accent)" : "#e2e8f0",
                              background: filterCollection === col.key ? "var(--admin-section-accent)" : "#ffffff",
                              color: filterCollection === col.key ? "#ffffff" : "#64748b",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              boxShadow: filterCollection === col.key ? "0 2px 5px rgb(80 133 158 / 15%)" : "none",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {col.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Visibilidad</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {[
                        { key: "all", label: "Todos" },
                        { key: "listed", label: "Visibles" },
                        { key: "hidden", label: "Ocultos" }
                      ].map((vis) => (
                        <button
                          type="button"
                          key={vis.key}
                          onClick={() => setFilterVisibility(vis.key)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 800,
                            border: "1px solid",
                            borderColor: filterVisibility === vis.key ? "#475569" : "#e2e8f0",
                            background: filterVisibility === vis.key ? "#475569" : "#ffffff",
                            color: filterVisibility === vis.key ? "#ffffff" : "#64748b",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: filterVisibility === vis.key ? "0 2px 4px rgba(71, 85, 105, 0.12)" : "none",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {vis.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="admin-list">
                <DndContext
                  sensors={dndSensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={filteredItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    {filteredItems.map((item, visibleIndex) => (
                      <SortableAdminListItem
                        key={item.id}
                        item={item}
                        locale={locale}
                        activeSection={activeSection}
                        isActive={item.id === selectedItem?.id}
                        reorderable={canReorder}
                        isFirst={visibleIndex === 0}
                        isLast={visibleIndex === filteredItems.length - 1}
                        visitTarget={getVisitTarget(activeSection, item, snapshot, locale)}
                        onSelect={() => selectItem(item.id)}
                        onMoveUp={() => moveItem(item.id, -1)}
                        onMoveDown={() => moveItem(item.id, 1)}
                        onVisitGuard={confirmDiscardUnsavedChanges}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}

          <div className="admin-editor-panel">
            {activeSection === "settings" ? (
              <SettingsEditor settings={settings} onChange={setSettings} onSave={handleSaveSettings} saveStatus={saveStatus} isSaving={isSaving} />
            ) : (
              <>
            <button type="button" className="admin-back-button" onClick={() => setMobileView("list")} aria-label="Volver a la lista">
              <FiChevronLeft aria-hidden="true" /> Lista
            </button>
            {selectedItem ? (
              <>
                <div className="admin-editor-toolbar">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <div className="admin-locale-tabs" aria-label="Idioma de edición" style={{ marginRight: 0 }}>
                      {locales.map((item) => (
                        <button type="button" key={item} className={item === locale ? "is-active" : ""} onClick={() => setLocale(item)}>{item.toUpperCase()}</button>
                      ))}
                    </div>
                    <select
                      className="admin-locale-select"
                      value={locale}
                      aria-label="Idioma de edición"
                      onChange={(e) => setLocale(e.target.value as Locale)}
                    >
                      {locales.map((item) => (
                        <option key={item} value={item}>{item.toUpperCase()}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="admin-button admin-button--translate"
                      onClick={translateCurrentItemManually}
                      disabled={isTranslating || isSaving}
                      title="Traducir campos vacíos a todos los demás idiomas usando DeepSeek"
                    >
                      <FiGlobe aria-hidden="true" className={isTranslating ? "admin-spin" : ""} />
                      {isTranslating ? "Traduciendo..." : "Traducir"}
                    </button>

                    {/* Indicador de estado de guardado discreto */}
                    <div className={`admin-save-badge admin-save-badge--${isSaving ? "saving" : hasUnsavedChanges ? "pending" : "synced"}`}>
                      {isSaving ? (
                        <>
                          <FiLoader className="admin-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : hasUnsavedChanges ? (
                        <>
                          <span className="admin-save-badge__dot" />
                          <span>Sin guardar</span>
                        </>
                      ) : (
                        <>
                          <FiCheckCircle />
                          <span>Guardado</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="admin-actions admin-actions--compact" style={{ gap: "12px" }}>
                    {visitTarget ? (
                      <button
                        type="button"
                        className="admin-button admin-button--view"
                        title="Abre la versión pública guardada"
                        onClick={() => {
                          if (confirmDiscardUnsavedChanges()) {
                            window.open(visitTarget.href, "_blank", "noopener,noreferrer");
                          }
                        }}
                      >
                        <FiExternalLink aria-hidden="true" /> {visitTarget.label}
                      </button>
                    ) : null}
                    <button type="button" className="admin-button admin-button--duplicate" onClick={duplicateItem}><FiCopy aria-hidden="true" /> Duplicar</button>
                    <button type="button" className="admin-button admin-button--danger" onClick={deleteItem}><FiTrash2 aria-hidden="true" /> Eliminar</button>
                  </div>
                </div>

                {saveStatus.tone === "error" && (
                  <div 
                    className={`admin-save-status admin-save-status--${saveStatus.tone}`} 
                    style={{ 
                      margin: "12px 0 18px 0",
                      width: "100%",
                      maxWidth: "none"
                    }}
                    role="alert"
                    aria-live="polite"
                  >
                    <span className="admin-save-status__icon">
                      {isSaving ? <FiLoader className="admin-spin" /> : <FiAlertCircle />}
                    </span>
                    <div>
                      <strong>{saveStatus.title}</strong>
                      <p>{saveStatus.message}</p>
                      {saveStatus.details?.length ? (
                        <ul>
                          {saveStatus.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                )}

                {translationStatus && translationSourceLocale && (
                  <div className="admin-translation-panel" style={{
                    margin: "12px 24px",
                    padding: "16px",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.9rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                        <FiGlobe /> Estado de traducción automática
                      </span>
                      {isTranslating ? (
                        <span style={{ color: "#0284c7", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                          <FiLoader className="admin-spin" /> Procesando con DeepSeek...
                        </span>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => setTranslationStatus(null)} 
                          style={{ border: "none", background: "none", color: "#64748b", cursor: "pointer", fontSize: "0.8rem" }}
                        >
                          Cerrar
                        </button>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
                      {locales.filter(loc => loc !== translationSourceLocale).map((loc) => {
                        const status = translationStatus[loc];
                        const errorMsg = translationErrors[loc];
                        
                        let color = "#64748b";
                        let icon = <FiLoader className="admin-spin" />;
                        let statusText = "Pendiente";
                        
                        if (status === "translating") {
                          color = "#0284c7";
                          icon = <FiLoader className="admin-spin" />;
                          statusText = "Traduciendo";
                        } else if (status === "completed") {
                          color = "#16a34a";
                          icon = <FiCheckCircle />;
                          statusText = "Completado";
                        } else if (status === "error") {
                          color = "#dc2626";
                          icon = <FiAlertCircle />;
                          statusText = "Error";
                        }

                        return (
                          <div key={loc} style={{
                            padding: "10px",
                            borderRadius: "6px",
                            backgroundColor: "#ffffff",
                            border: `1px solid ${status === "translating" ? "#bae6fd" : "#e2e8f0"}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px"
                          }}>
                            <span style={{ fontWeight: 700, color: "#1e293b" }}>{loc.toUpperCase()}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color, fontSize: "0.8rem", fontWeight: 550 }}>
                              {icon} {statusText}
                            </div>
                            {errorMsg && (
                              <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "2px", wordBreak: "break-word" }} title={errorMsg}>
                                {errorMsg.substring(0, 40)}{errorMsg.length > 40 ? "..." : ""}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <ItemEditor activeSection={activeSection} item={selectedItem} locale={locale} onChange={updateSelectedItem} />
              </>
            ) : (
              <div className="admin-empty-state">
                <FiFileText aria-hidden="true" />
                <h2>No hay contenido todavía</h2>
                <p>Crea un elemento para empezar.</p>
              </div>
            )}
            </>
            )}
          </div>
        </section>
      </main>
      {hasUnsavedChanges && activeSection !== "settings" && (
        <div className="admin-floating-publish">
          <button
            type="button"
            className="admin-button admin-button--primary"
            onClick={() => void saveToSupabase()}
            disabled={isSaving}
            aria-busy={isSaving}
          >
            {isSaving ? <FiLoader aria-hidden="true" className="admin-spin" /> : <FiSave aria-hidden="true" />} {isSaving ? "Guardando" : "Guardar cambios"}
          </button>
        </div>
      )}
      {translationConfirmOpen && (
        <div className={`admin-modal-backdrop ${translationConfirmVisible ? "is-visible" : ""}`} onClick={closeTranslationConfirm}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-icon-container">
                <FiGlobe aria-hidden="true" />
              </div>
              <h3 className="admin-modal-title">Confirmar traducción</h3>
            </div>
            <div className="admin-modal-body">
              Ya existen traducciones guardadas para otros idiomas. ¿Estás seguro de que deseas ejecutar la traducción automática con DeepSeek para los campos que aún están vacíos? Esto respetará las traducciones ya hechas y solo completará las faltantes.
            </div>
            <div className="admin-modal-actions">
              <button type="button" className="admin-modal-btn admin-modal-btn--secondary" onClick={closeTranslationConfirm}>
                Cancelar
              </button>
              <button type="button" className="admin-modal-btn admin-modal-btn--primary" onClick={handleConfirmTranslation}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsEditor({
  settings,
  onChange,
  onSave,
  saveStatus,
  isSaving
}: {
  settings: SiteSettings;
  onChange: (settings: SiteSettings) => void;
  onSave: () => void;
  saveStatus: AdminSaveStatus;
  isSaving: boolean;
}) {
  return (
    <div className="admin-form" style={{ maxWidth: "800px" }}>
      <div className="admin-editor-toolbar" style={{ justifyContent: "flex-start" }}>
        <h2 style={{ margin: 0, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiSettings aria-hidden="true" /> Configuración
        </h2>
      </div>
      <p className="admin-kicker">Números de WhatsApp por idioma</p>
      <div className="admin-form-grid admin-form-grid--two">
        <label className="admin-field">
          <span>Default (sin idioma específico)</span>
          <input
            value={settings.whatsappNumbers?.default ?? ""}
            onChange={(e) => onChange({ ...settings, whatsappNumbers: { ...settings.whatsappNumbers, default: e.target.value } })}
            placeholder="+34 600 000 000"
          />
        </label>
        {locales.map((loc) => (
          <label className="admin-field" key={loc}>
            <span>{loc.toUpperCase()}</span>
            <input
              value={settings.whatsappNumbers?.[loc] ?? ""}
              onChange={(e) => onChange({ ...settings, whatsappNumbers: { ...settings.whatsappNumbers, [loc]: e.target.value } })}
              placeholder="+34 600 000 000"
            />
          </label>
        ))}
      </div>
      <div className="admin-actions" style={{ marginTop: "16px" }}>
        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={() => void onSave()}
          disabled={isSaving}
          aria-busy={isSaving}
        >
          {isSaving ? <FiLoader aria-hidden="true" className="admin-spin" /> : <FiSave aria-hidden="true" />}
          {isSaving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
      {saveStatus.tone !== "info" && (
        <div className={`admin-save-status admin-save-status--${saveStatus.tone}`} style={{ marginTop: "16px" }} role={saveStatus.tone === "error" ? "alert" : "status"} aria-live="polite">
          <span className="admin-save-status__icon">
            {isSaving ? <FiLoader aria-hidden="true" className="admin-spin" /> : saveStatus.tone === "success" ? <FiCheckCircle /> : saveStatus.tone === "error" ? <FiAlertCircle /> : <FiSave />}
          </span>
          <div>
            <strong>{saveStatus.title}</strong>
            <p>{saveStatus.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemEditor({ activeSection, item, locale, onChange }: { activeSection: AdminContentKey | "settings"; item: AdminItem; locale: Locale; onChange: (patch: Partial<AdminItem>) => void }) {
  if (activeSection === "boats" && "kind" in item && item.kind === "boat") {
    return <BoatEditor boat={item} locale={locale} onChange={(patch) => onChange(patch as Partial<AdminItem>)} />;
  }

  if (activeSection === "boatCollections" && "kind" in item && item.kind === "boatCollection") {
    return <BoatCollectionEditor collection={item} locale={locale} onChange={(patch) => onChange(patch as Partial<AdminItem>)} />;
  }

  if (activeSection === "vehicles" && "kind" in item && item.kind === "vehicle") {
    return <VehicleEditor vehicle={item} locale={locale} onChange={(patch) => onChange(patch as Partial<AdminItem>)} />;
  }

  if (activeSection === "waterToys" && "kind" in item && item.kind === "waterToy") {
    return <WaterToyEditor toy={item} locale={locale} onChange={(patch) => onChange(patch as Partial<AdminItem>)} />;
  }

  if (activeSection === "servicePages" && "kind" in item && item.kind === "service") {
    return <ServicePageEditor page={item} locale={locale} onChange={(patch) => onChange(patch as Partial<AdminItem>)} />;
  }

  if (activeSection === "seoPages" && "kind" in item && item.kind === "seoPage") {
    return <SeoPageEditor page={item} locale={locale} onChange={(patch) => onChange(patch as Partial<AdminItem>)} />;
  }

  if (activeSection === "faqs" && "question" in item) {
    return <FaqEditor faq={item} locale={locale} onChange={(patch) => onChange(patch as Partial<AdminItem>)} />;
  }

  return isGenericContentItem(item) ? <GenericContentEditor item={item} locale={locale} onChange={onChange} /> : null;
}

function BoatCollectionEditor({ collection, locale, onChange }: { collection: BoatCollection; locale: Locale; onChange: (patch: Partial<BoatCollection>) => void }) {
  return (
    <div className="admin-form">
      {/* Sección 1: Organización y Metas */}
      <div className="admin-subpanel-header" style={{ marginTop: 0 }}>
        <FiLayers className="admin-subpanel-icon" />
        <h3>Clasificación y Metas</h3>
      </div>
      <div className="admin-form-grid admin-form-grid--two" style={{ marginBottom: "24px" }}>
        <label className="admin-field">
          <span>Tipo de colección</span>
          <select value={collection.collectionId} onChange={(event) => onChange({ collectionId: event.target.value as BoatCollection["collectionId"] })}>
            <option value="yachts-xl">Yates XL</option>
            <option value="yachts">Yates</option>
            <option value="fast-boats">Embarcaciones rápidas</option>
          </select>
        </label>
        <TextField label="Objetivo de barcos" value={String(collection.countTarget ?? 0)} onChange={(value) => onChange({ countTarget: Number.parseInt(value, 10) || 0 })} />
      </div>

      {/* Sección 2: Visibilidad */}
      <div className="admin-subpanel-header">
        <FiEyeOff className="admin-subpanel-icon" />
        <h3>Configuración de Visibilidad</h3>
      </div>
      <div className="admin-form-grid admin-form-grid--two" style={{ marginBottom: "28px" }}>
        <label className={`admin-check-card ${collection.hiddenPage ? "is-active" : ""}`}>
          <input type="checkbox" checked={collection.hiddenPage} onChange={(event) => onChange({ hiddenPage: event.target.checked })} />
          <div className="admin-check-card__content">
            <span className="admin-check-card__icon">
              {collection.hiddenPage ? <FiEyeOff /> : <FiEye />}
            </span>
            <div className="admin-check-card__info">
              <strong>Página oculta en menú</strong>
              <small>{collection.hiddenPage ? "No visible en navegación" : "Visible en el menú"}</small>
            </div>
          </div>
        </label>

        <label className={`admin-check-card ${collection.hideWhatsappButton ? "is-active" : ""}`}>
          <input type="checkbox" checked={!!collection.hideWhatsappButton} onChange={(event) => onChange({ hideWhatsappButton: event.target.checked })} />
          <div className="admin-check-card__content">
            <span className="admin-check-card__icon">
              <FiMessageCircle />
            </span>
            <div className="admin-check-card__info">
              <strong>Ocultar botón de WhatsApp</strong>
              <small>{collection.hideWhatsappButton ? "Chat desactivado en la colección" : "Chat activo en la colección"}</small>
            </div>
          </div>
        </label>
      </div>

      <MediaEditor image={collection.image} gallery={[]} locale={locale} itemLabel={getLocalizedValue(collection.title, locale)} onChange={(image) => onChange({ image })} />
      <LocalizedTextEditor label="Título" value={collection.title} locale={locale} onChange={(value) => onChange({ title: value })} />
      <LocalizedTextEditor label="Título Hero (Personalizado)" value={collection.heroTitle ?? localized("")} locale={locale} onChange={(value) => onChange({ heroTitle: value })} />
      <LocalizedTextEditor label="Etiqueta de Precio/Badge" value={collection.priceTag ?? localized("")} locale={locale} onChange={(value) => onChange({ priceTag: value })} />
      <LocalizedTextEditor label="Descripción" value={collection.description} locale={locale} multiline onChange={(value) => onChange({ description: value })} />

      {/* Sección 3: Formato de la Descripción */}
      <div className="admin-form-grid admin-form-grid--two" style={{ marginTop: "12px", marginBottom: "28px" }}>
        <label className={`admin-check-card ${collection.descriptionBold ? "is-active" : ""}`}>
          <input type="checkbox" checked={!!collection.descriptionBold} onChange={(event) => onChange({ descriptionBold: event.target.checked })} />
          <div className="admin-check-card__content">
            <span className="admin-check-card__icon">
              <FiBold />
            </span>
            <div className="admin-check-card__info">
              <strong>Texto en Negrita</strong>
              <small>{collection.descriptionBold ? "Texto destacado activado" : "Texto estándar"}</small>
            </div>
          </div>
        </label>

        <label className={`admin-check-card ${collection.descriptionItalic ? "is-active" : ""}`}>
          <input type="checkbox" checked={!!collection.descriptionItalic} onChange={(event) => onChange({ descriptionItalic: event.target.checked })} />
          <div className="admin-check-card__content">
            <span className="admin-check-card__icon">
              <FiItalic />
            </span>
            <div className="admin-check-card__info">
              <strong>Texto en Cursiva</strong>
              <small>{collection.descriptionItalic ? "Texto inclinado activado" : "Texto estándar"}</small>
            </div>
          </div>
        </label>
      </div>
      {!collection.hideWhatsappButton && (
        <LocalizedTextEditor label="Texto botón WhatsApp (Personalizado)" value={collection.whatsappLabel ?? localized("")} locale={locale} onChange={(value) => onChange({ whatsappLabel: value })} />
      )}
      <LocalizedTextEditor label="Slug por idioma" value={collection.slugsByLocale} locale={locale} onChange={(value) => onChange({ slugsByLocale: value })} />
      <LocalizedTextEditor label="Nota de selección" value={collection.selectionNote} locale={locale} multiline onChange={(value) => onChange({ selectionNote: value })} />
      <LocalizedTextEditor label="Título SEO" value={collection.seoTitle} locale={locale} onChange={(value) => onChange({ seoTitle: value })} />
      <LocalizedTextEditor label="Descripción SEO" value={collection.seoDescription} locale={locale} multiline onChange={(value) => onChange({ seoDescription: value })} />
      <LocalizedTextEditor label="Mensaje WhatsApp" value={collection.whatsappMessage} locale={locale} multiline onChange={(value) => onChange({ whatsappMessage: value })} />
    </div>
  );
}

function BoatEditor({ boat, locale, onChange }: { boat: Boat; locale: Locale; onChange: (patch: Partial<Boat>) => void }) {
  const richValue = boat.description?.[locale] ?? boat.description?.es ?? { html: "", text: "" };

  async function uploadImageForDescription(file: File): Promise<string> {
    const asset = await uploadAdminStorageFile(file, "boat-body");

    return asset.src;
  }

  return (
    <div className="admin-form">
      <div className="admin-form-grid admin-form-grid--two">
        <TextField label="Nombre visible" value={boat.name} onChange={(value) => onChange({ name: value })} />
        <label className="admin-field">
          <span>Colección</span>
          <select
            value={boat.collectionId}
            onChange={(event) => {
              const collectionId = event.target.value as Boat["collectionId"];
              onChange({ collectionId, categorySlugsByLocale: categorySlugsByCollection[collectionId] });
            }}
          >
            <option value="yachts-xl">Yates XL</option>
            <option value="yachts">Yates</option>
            <option value="fast-boats">Embarcaciones rápidas</option>
          </select>
        </label>
      </div>
      <MediaEditor image={boat.image} gallery={boat.gallery} locale={locale} itemLabel={boat.name} onChange={(image, gallery) => onChange({ image, gallery })} />
      <BoatVideoEditor video={boat.video} locale={locale} itemLabel={boat.name} onChange={(video) => onChange({ video })} />
      <LocalizedTextEditor label="Slug por idioma" value={boat.slugsByLocale} locale={locale} onChange={(value) => onChange({ slugsByLocale: value })} />
      <LocalizedTextEditor label="Título SEO" value={boat.seoTitle} locale={locale} onChange={(value) => onChange({ seoTitle: value })} />
      <LocalizedTextEditor label="Descripción SEO" value={boat.seoDescription} locale={locale} multiline onChange={(value) => onChange({ seoDescription: value })} />
      <LocalizedTextEditor label="Precio / disponibilidad" value={boat.priceLabel ?? localized("")} locale={locale} onChange={(value) => onChange({ priceLabel: value })} />
      <LocalizedTextEditor label="Puerto / Marina de salida" value={boat.marina ?? localized("")} locale={locale} onChange={(value) => onChange({ marina: value })} />
      <SpecsEditor specs={boat.specs} locale={locale} onChange={(specs) => onChange({ specs })} />
      <RichTextEditor
        id={`rich-${boat.id}-${locale}`}
        label={`Descripción completa (${locale.toUpperCase()})`}
        value={richValue.html}
        onChange={(html, text) => onChange({ description: { ...boat.description, [locale]: { html, text } } })}
        onUploadImage={uploadImageForDescription}
      />
      <AmenitiesEditor amenities={boat.amenities ?? []} locale={locale} onChange={(amenities) => onChange({ amenities })} />
      <LocalizedTextEditor label="Mensaje WhatsApp" value={boat.whatsappMessage} locale={locale} multiline onChange={(value) => onChange({ whatsappMessage: value })} />
    </div>
  );
}

function ManagedDetailsEditor({
  itemId,
  itemLabel,
  locale,
  image,
  gallery,
  specs,
  slugsByLocale,
  seoTitle,
  seoDescription,
  priceLabel,
  marina,
  richDescription,
  richFallback,
  amenities,
  whatsappMessage,
  uploadPrefix,
  onChange
}: {
  itemId: string;
  itemLabel: string;
  locale: Locale;
  image: MediaAsset;
  gallery?: MediaAsset[];
  specs?: SpecItem[];
  slugsByLocale: LocalizedText;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  priceLabel?: LocalizedText;
  marina?: LocalizedText;
  richDescription?: RichTextByLocale;
  richFallback?: LocalizedText;
  amenities?: Array<string | LocalizedText>;
  whatsappMessage: LocalizedText;
  uploadPrefix: string;
  onChange: (patch: ManagedDetailsPatch) => void;
}) {
  const richValue = getRichTextValue(richDescription, locale, richFallback);

  return (
    <>
      <MediaEditor image={image} gallery={gallery ?? []} locale={locale} itemLabel={itemLabel} onChange={(nextImage, nextGallery) => onChange({ image: nextImage, gallery: nextGallery })} />
      <LocalizedTextEditor label="Slug por idioma" value={slugsByLocale} locale={locale} onChange={(value) => onChange({ slugsByLocale: value })} />
      <LocalizedTextEditor label="Título SEO" value={seoTitle} locale={locale} onChange={(value) => onChange({ seoTitle: value })} />
      <LocalizedTextEditor label="Descripción SEO" value={seoDescription} locale={locale} multiline onChange={(value) => onChange({ seoDescription: value })} />
      <LocalizedTextEditor label="Precio / disponibilidad" value={priceLabel ?? localized("")} locale={locale} onChange={(value) => onChange({ priceLabel: value })} />
      <LocalizedTextEditor label="Puerto / ubicación de salida" value={marina ?? localized("")} locale={locale} onChange={(value) => onChange({ marina: value })} />
      <SpecsEditor specs={specs ?? []} locale={locale} onChange={(nextSpecs) => onChange({ specs: nextSpecs })} />
      <RichTextEditor
        id={`rich-${itemId}-${locale}`}
        label={`Descripción completa (${locale.toUpperCase()})`}
        value={richValue.html}
        onChange={(html, text) => onChange({ richDescription: { ...richDescription, [locale]: { html, text } } })}
        onUploadImage={(file) => uploadRichTextImage(file, uploadPrefix)}
      />
      <AmenitiesEditor amenities={amenities ?? []} locale={locale} onChange={(items) => onChange({ amenities: items })} />
      <LocalizedTextEditor label="Mensaje WhatsApp" value={whatsappMessage} locale={locale} multiline onChange={(value) => onChange({ whatsappMessage: value })} />
    </>
  );
}

function VehicleEditor({ vehicle, locale, onChange }: { vehicle: Vehicle; locale: Locale; onChange: (patch: Partial<Vehicle>) => void }) {
  return (
    <div className="admin-form">
      <TextField label="Nombre visible" value={vehicle.name} onChange={(value) => onChange({ name: value })} />
      <LocalizedTextEditor label="Resumen para tarjetas" value={vehicle.overview} locale={locale} multiline onChange={(value) => onChange({ overview: value })} />
      <ManagedDetailsEditor
        itemId={vehicle.id}
        itemLabel={vehicle.name}
        locale={locale}
        image={vehicle.image}
        gallery={vehicle.gallery}
        specs={vehicle.specs}
        slugsByLocale={vehicle.slugsByLocale}
        seoTitle={vehicle.seoTitle}
        seoDescription={vehicle.seoDescription}
        priceLabel={vehicle.priceLabel}
        marina={vehicle.marina}
        richDescription={vehicle.richDescription}
        richFallback={vehicle.overview}
        amenities={vehicle.amenities ?? vehicle.services}
        whatsappMessage={vehicle.whatsappMessage}
        uploadPrefix="vehicle-body"
        onChange={(patch) => onChange(patch as Partial<Vehicle>)}
      />
    </div>
  );
}

function WaterToyEditor({ toy, locale, onChange }: { toy: WaterToy; locale: Locale; onChange: (patch: Partial<WaterToy>) => void }) {
  const itemLabel = getLocalizedValue(toy.name, locale);

  return (
    <div className="admin-form">
      <LocalizedTextEditor label="Nombre visible" value={toy.name} locale={locale} onChange={(value) => onChange({ name: value })} />
      <LocalizedTextEditor label="Resumen para tarjetas" value={toy.description} locale={locale} multiline onChange={(value) => onChange({ description: value })} />
      <LocalizedTextEditor label="Texto breve de ficha" value={toy.details} locale={locale} multiline onChange={(value) => onChange({ details: value })} />
      <ManagedDetailsEditor
        itemId={toy.id}
        itemLabel={itemLabel}
        locale={locale}
        image={toy.image}
        gallery={toy.gallery}
        specs={toy.specs}
        slugsByLocale={toy.slugsByLocale}
        seoTitle={toy.seoTitle}
        seoDescription={toy.seoDescription}
        priceLabel={toy.priceLabel}
        marina={toy.marina}
        richDescription={toy.richDescription}
        richFallback={toy.details}
        amenities={toy.amenities}
        whatsappMessage={toy.whatsappMessage}
        uploadPrefix="water-toy-body"
        onChange={(patch) => onChange(patch as Partial<WaterToy>)}
      />
    </div>
  );
}

function ServicePageEditor({ page, locale, onChange }: { page: ServicePage; locale: Locale; onChange: (patch: Partial<ServicePage>) => void }) {
  const itemLabel = getLocalizedValue(page.title, locale);
  const showsOptionsEditor = optionDrivenServicePages.has(page.serviceId);
  const relatedItemsMessage = page.serviceId === "transfers"
    ? "Las tarjetas y fichas públicas de este servicio se gestionan en la sección Transfer."
    : page.serviceId === "water-toys"
      ? "Las tarjetas y fichas públicas de este servicio se gestionan en la sección Juguetes."
      : page.serviceId === "contact"
        ? "Esta página solo usa el contenido general del servicio y no muestra tarjetas adicionales."
        : page.serviceId === "water-taxi"
          ? "Taxi Boat muestra una portada a pantalla completa. Solo edita el título, la descripción y el mensaje de WhatsApp."
          : null;

  return (
    <div className="admin-form">
      <label className="admin-field">
        <span>Servicio interno</span>
        <select value={page.serviceId} onChange={(event) => onChange({ serviceId: event.target.value as ServicePageId })}>
          {servicePageIds.map((serviceId) => (
            <option key={serviceId} value={serviceId}>{servicePageLabels[serviceId]}</option>
          ))}
        </select>
      </label>
      <LocalizedTextEditor label="Título H1" value={page.title} locale={locale} onChange={(value) => onChange({ title: value })} />
      <LocalizedTextEditor label="Resumen del hero" value={page.description} locale={locale} multiline onChange={(value) => onChange({ description: value })} />
      <ManagedDetailsEditor
        itemId={page.id}
        itemLabel={itemLabel}
        locale={locale}
        image={page.image}
        gallery={page.gallery}
        specs={page.specs}
        slugsByLocale={page.slugsByLocale}
        seoTitle={page.seoTitle}
        seoDescription={page.seoDescription}
        priceLabel={page.priceLabel}
        marina={page.marina}
        richDescription={page.richDescription}
        richFallback={page.description}
        amenities={page.amenities}
        whatsappMessage={page.whatsappMessage}
        uploadPrefix="service-body"
        onChange={(patch) => onChange(patch as Partial<ServicePage>)}
      />
      {showsOptionsEditor ? (
        <ServiceOptionsEditor
          serviceId={page.serviceId}
          options={page.options ?? []}
          locale={locale}
          onChange={(options) => onChange({ options })}
        />
      ) : relatedItemsMessage ? (
        <div className="admin-gallery-empty">
          <FiBriefcase aria-hidden="true" />
          <span>{relatedItemsMessage}</span>
        </div>
      ) : null}
    </div>
  );
}

function createServiceOption(serviceId: string): ServiceOption {
  const baseId = serviceId ? `${serviceId}-option` : "service-option";

  return {
    id: createId(baseId),
    name: localized("Nueva opcion"),
    description: localized("Descripcion breve para la tarjeta."),
    details: localized("Detalle operativo para explicar disponibilidad, condiciones o logistica."),
    image: { ...blankImage, alt: localized("") },
    whatsappMessage: localized("Hola, quiero consultar disponibilidad para este servicio en Ibiza.")
  };
}

function ServiceOptionsEditor({
  serviceId,
  options,
  locale,
  onChange
}: {
  serviceId: string;
  options: ServiceOption[];
  locale: Locale;
  onChange: (options: ServiceOption[]) => void;
}) {
  function updateOption(index: number, patch: Partial<ServiceOption>) {
    onChange(options.map((option, optionIndex) => (optionIndex === index ? { ...option, ...patch } : option)));
  }

  function addOption() {
    onChange([...options, createServiceOption(serviceId)]);
  }

  function removeOption(index: number) {
    onChange(options.filter((_, optionIndex) => optionIndex !== index));
  }

  return (
    <section className="admin-subpanel">
      <div className="admin-panel-heading admin-panel-heading--compact">
        <h3><FiLayers aria-hidden="true" /> Opciones de la home y ficha</h3>
        <button type="button" className="admin-icon-button" onClick={addOption} aria-label="Agregar opcion de servicio">
          <FiPlus aria-hidden="true" />
        </button>
      </div>
      {!options.length ? (
        <div className="admin-gallery-empty">
          <FiBriefcase aria-hidden="true" />
          <span>Agrega opciones para que esta seccion aparezca con tarjetas en la home y en su ficha.</span>
        </div>
      ) : null}
      <div className="admin-form">
        {options.map((option, index) => {
          const optionLabel = getLocalizedValue(option.name, locale) || `Opcion ${index + 1}`;

          return (
            <section className="admin-subpanel" key={option.id || index}>
              <div className="admin-panel-heading admin-panel-heading--compact">
                <h3>{optionLabel}</h3>
                <button type="button" className="admin-icon-button admin-icon-button--danger" onClick={() => removeOption(index)} aria-label="Eliminar opcion de servicio">
                  <FiTrash2 aria-hidden="true" />
                </button>
              </div>
              <TextField label="ID/ancla interna" value={option.id} onChange={(value) => updateOption(index, { id: value.trim() })} />
              <LocalizedTextEditor label="Nombre" value={option.name} locale={locale} onChange={(value) => updateOption(index, { name: value })} />
              <LocalizedTextEditor label="Descripcion de tarjeta" value={option.description} locale={locale} multiline onChange={(value) => updateOption(index, { description: value })} />
              <LocalizedTextEditor label="Detalle operativo" value={option.details} locale={locale} multiline onChange={(value) => updateOption(index, { details: value })} />
              <LocalizedTextEditor label="Mensaje WhatsApp" value={option.whatsappMessage} locale={locale} multiline onChange={(value) => updateOption(index, { whatsappMessage: value })} />
              <MediaEditor
                image={option.image}
                gallery={option.gallery ?? []}
                locale={locale}
                itemLabel={optionLabel}
                onChange={(image, gallery) => updateOption(index, { image, gallery })}
              />
            </section>
          );
        })}
      </div>
    </section>
  );
}

function SeoPageEditor({ page, locale, onChange }: { page: SeoPage; locale: Locale; onChange: (patch: Partial<SeoPage>) => void }) {
  const richValue = page.body[locale] ?? page.body.es;

  async function uploadImageForBody(file: File): Promise<string> {
    const asset = await uploadAdminStorageFile(file, "body");

    return asset.src;
  }

  return (
    <div className="admin-form">
      <LocalizedTextEditor label="Título H1" value={page.title} locale={locale} onChange={(value) => onChange({ title: value })} />
      <LocalizedTextEditor label="Resumen" value={page.excerpt} locale={locale} multiline onChange={(value) => onChange({ excerpt: value })} />
      <LocalizedTextEditor label="Slug por idioma" value={page.slugsByLocale} locale={locale} onChange={(value) => onChange({ slugsByLocale: value })} />
      <LocalizedTextEditor label="Título SEO" value={page.seoTitle} locale={locale} onChange={(value) => onChange({ seoTitle: value })} />
      <LocalizedTextEditor label="Descripción SEO" value={page.seoDescription} locale={locale} multiline onChange={(value) => onChange({ seoDescription: value })} />
      <RichTextEditor
        id={`rich-${page.id}-${locale}`}
        label={`Contenido enriquecido (${locale.toUpperCase()})`}
        value={richValue.html}
        onChange={(html, text) => onChange({ body: { ...page.body, [locale]: { html, text } } })}
        onUploadImage={uploadImageForBody}
      />
      <MediaEditor image={page.image} gallery={page.gallery} locale={locale} itemLabel={getLocalizedValue(page.title, locale)} onChange={(image, gallery) => onChange({ image, gallery })} />
      <TextAreaField label="Notas internas" value={page.internalNotes ?? ""} onChange={(value) => onChange({ internalNotes: value })} />
      <SeoPreview title={getLocalizedValue(page.title, locale)} description={getLocalizedValue(page.seoDescription, locale)} slug={getLocalizedValue(page.slugsByLocale, locale)} html={richValue.html} />
    </div>
  );
}

function FaqEditor({ faq, locale, onChange }: { faq: FaqItem; locale: Locale; onChange: (patch: Partial<FaqItem>) => void }) {
  return (
    <div className="admin-form">
      <LocalizedTextEditor label="Pregunta" value={faq.question} locale={locale} onChange={(value) => onChange({ question: value })} />
      <LocalizedTextEditor label="Respuesta" value={faq.answer} locale={locale} multiline onChange={(value) => onChange({ answer: value })} />
      <label className="admin-field">
        <span>Servicio asociado</span>
        <select value={faq.serviceId ?? ""} onChange={(event) => onChange({ serviceId: event.target.value ? event.target.value as FaqItem["serviceId"] : undefined })}>
          <option value="">General</option>
          <option value="boats">Barcos</option>
          <option value="transfers">Transfer</option>
          <option value="water-toys">Juguetes náuticos</option>
          <option value="security">Seguridad</option>
          <option value="self-drive">Vehículos sin conductor</option>
        </select>
      </label>
    </div>
  );
}

function GenericContentEditor({ item, locale, onChange }: { item: GenericContentItem; locale: Locale; onChange: (patch: Partial<AdminItem>) => void }) {
  return (
    <div className="admin-form">
      <LocalizedTextEditor label="Título" value={item.title} locale={locale} onChange={(value) => onChange({ title: value } as Partial<AdminItem>)} />
      <LocalizedTextEditor label="Descripción" value={item.description} locale={locale} multiline onChange={(value) => onChange({ description: value } as Partial<AdminItem>)} />
      <LocalizedTextEditor label="Título SEO" value={item.seoTitle} locale={locale} onChange={(value) => onChange({ seoTitle: value } as Partial<AdminItem>)} />
      <LocalizedTextEditor label="Descripción SEO" value={item.seoDescription} locale={locale} multiline onChange={(value) => onChange({ seoDescription: value } as Partial<AdminItem>)} />
    </div>
  );
}

function normalizeAmenity(item: string | LocalizedText): LocalizedText {
  return typeof item === "string" ? localized(item) : { ...localized(item.es ?? item.en ?? ""), ...item };
}

function AmenitiesEditor({ amenities, locale, onChange }: { amenities: Array<string | LocalizedText>; locale: Locale; onChange: (items: LocalizedText[]) => void }) {
  const normalizedAmenities = amenities.map(normalizeAmenity);

  return (
    <section className="admin-subpanel">
      <div className="admin-panel-heading admin-panel-heading--compact">
        <h3>Equipamiento a bordo por idioma</h3>
        <button
          type="button"
          className="admin-icon-button"
          onClick={() => onChange([...normalizedAmenities, localized("")])}
          aria-label="Agregar equipamiento"
        >
          <FiPlus aria-hidden="true" />
        </button>
      </div>
      <div className="admin-spec-list">
        {normalizedAmenities.map((item, index) => (
          <div className="admin-amenity-row" key={`amenity-${index}-${item.es || index}`}>
            <LocalizedTextEditor
              label={`Equipamiento ${index + 1}`}
              value={item}
              locale={locale}
              onChange={(value) => onChange(normalizedAmenities.map((amenity, amenityIndex) => (amenityIndex === index ? value : amenity)))}
            />
            <button
              type="button"
              className="admin-icon-button admin-icon-button--danger"
              onClick={() => onChange(normalizedAmenities.filter((_, amenityIndex) => amenityIndex !== index))}
              aria-label="Eliminar equipamiento"
            >
              <FiTrash2 aria-hidden="true" />
            </button>
          </div>
        ))}
        {normalizedAmenities.length === 0 && (
          <p className="admin-empty-hint">Sin equipamiento. Pulsa + para añadir ítems.</p>
        )}
      </div>
    </section>
  );
}

function BoatVideoEditor({ video, locale, itemLabel, onChange }: { video?: VideoAsset; locale: Locale; itemLabel: string; onChange: (video?: VideoAsset) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [statusTone, setStatusTone] = useState<FeedbackTone>("info");
  const [status, setStatus] = useState("");
  const titleFallback = localized(itemLabel.trim() ? `Video de ${itemLabel}` : "Video del barco");
  const currentTitle = video?.title ?? titleFallback;

  function updateVideo(patch: Partial<VideoAsset>) {
    onChange({
      src: video?.src ?? "",
      title: currentTitle,
      source: video?.source ?? "external",
      ...video,
      ...patch
    });
  }

  async function uploadVideo(fileList: FileList | null) {
    if (isUploading) return;

    const file = Array.from(fileList ?? []).find((candidate) => candidate.type.startsWith("video/"));

    if (!file) {
      setStatusTone("error");
      setStatus("Selecciona un archivo de video valido: MP4, WebM o MOV.");
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      setStatusTone("error");
      setStatus("El video supera 200 MB. Comprimelo antes de subirlo.");
      return;
    }

    setIsUploading(true);
    setStatusTone("info");
    setStatus("Subiendo video a Supabase Storage...");

    try {
      const asset = await uploadAdminStorageFile(file, "boat-video");

      onChange({
        src: asset.src,
        title: currentTitle,
        source: "supabase",
        storagePath: asset.storagePath,
        mimeType: file.type || undefined
      });
      setStatusTone("success");
      setStatus("Video subido. Pulsa \"Publicar en el sitio\" para que aparezca en la web.");
    } catch (error) {
      setStatusTone("error");
      setStatus(error instanceof Error ? error.message : "No se pudo subir el video.");
    } finally {
      setIsUploading(false);
    }
  }

  async function removeVideo() {
    if (isUploading) return;

    if (video?.storagePath) {
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase.storage.from(supabaseGalleryBucket).remove([video.storagePath]);
      } catch {
        setStatusTone("info");
        setStatus("El video se quito del contenido, pero no se pudo borrar el archivo del bucket.");
      }
    }

    onChange(undefined);
    setStatusTone("info");
    setStatus("Video quitado. Pulsa \"Publicar en el sitio\" para aplicar el cambio.");
  }

  return (
    <section className="admin-subpanel admin-video-editor">
      <div className="admin-panel-heading admin-panel-heading--compact">
        <h3><FiVideo aria-hidden="true" /> Video de la ficha individual</h3>
        {video?.src ? <span className="admin-pill">Activo</span> : <span className="admin-pill">Opcional</span>}
      </div>

      <label className={`admin-upload-dropzone ${isUploading ? "is-uploading" : ""}`} aria-disabled={isUploading}>
        {isUploading ? <FiLoader aria-hidden="true" className="admin-spin" /> : <FiVideo aria-hidden="true" />}
        <span>{isUploading ? "Subiendo video" : "Subir MP4, WebM o MOV"}</span>
        <small>Máximo 200 MB. También puedes pegar una URL directa al video.</small>
        <input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={isUploading} onChange={(event) => { void uploadVideo(event.target.files); event.target.value = ""; }} />
      </label>

      {video?.src ? (
        <video className="admin-video-preview" src={video.src} controls preload="metadata" />
      ) : null}

      <div className="admin-video-editor__fields">
        <TextField label="URL del video" value={video?.src ?? ""} onChange={(value) => updateVideo({ src: value, source: value ? "external" : undefined, storagePath: undefined, mimeType: undefined })} />
        <LocalizedTextEditor label="Titulo del video" value={currentTitle} locale={locale} onChange={(value) => updateVideo({ title: value })} />
      </div>

      <div className="admin-actions admin-actions--compact">
        <button type="button" className="admin-button admin-button--ghost" onClick={() => updateVideo({ src: video?.src ?? "", title: currentTitle })} disabled={isUploading}>
          <FiPlus aria-hidden="true" /> Preparar video
        </button>
        {video?.src ? (
          <button type="button" className="admin-button admin-button--danger" onClick={() => { void removeVideo(); }} disabled={isUploading}>
            <FiTrash2 aria-hidden="true" /> Quitar video
          </button>
        ) : null}
      </div>

      {status ? (
        <div className={`admin-upload-status admin-upload-status--${statusTone}`} role={statusTone === "error" ? "alert" : "status"} aria-live="polite">
          <strong>{status}</strong>
        </div>
      ) : null}
    </section>
  );
}

function SpecsEditor({ specs, locale, onChange }: { specs: SpecItem[]; locale: Locale; onChange: (specs: SpecItem[]) => void }) {
  function updateSpec(index: number, patch: Partial<SpecItem>) {
    onChange(specs.map((spec, specIndex) => (specIndex === index ? { ...spec, ...patch } : spec)));
  }

  return (
    <section className="admin-subpanel">
      <div className="admin-panel-heading admin-panel-heading--compact">
        <h3>Specs parametrizadas</h3>
        <button type="button" className="admin-icon-button" onClick={() => onChange([...specs, { label: localized("Nuevo spec"), value: localized(""), icon: "water" }])} aria-label="Agregar spec">
          <FiPlus aria-hidden="true" />
        </button>
      </div>
      <div className="admin-spec-list">
        {specs.map((spec, index) => (
          <div className="admin-spec-row" key={`spec-${index}-${getLocalizedValue(spec.label, locale) || index}`}>
            <select value={spec.icon ?? "water"} onChange={(event) => updateSpec(index, { icon: event.target.value as SpecItem["icon"] })} aria-label="Icono del spec">
              <option value="cabins">Cabinas</option>
              <option value="length">Eslora</option>
              <option value="passengers">Pasajeros</option>
              <option value="bathrooms">Baños</option>
              <option value="bags">Maletas</option>
              <option value="comfort">Confort</option>
              <option value="water">Agua</option>
            </select>
            <input value={getLocalizedValue(spec.value, locale)} onChange={(event) => updateSpec(index, { value: { ...spec.value, [locale]: event.target.value } })} aria-label="Valor del spec" />
            <input value={getLocalizedValue(spec.label, locale)} onChange={(event) => updateSpec(index, { label: { ...spec.label, [locale]: event.target.value } })} aria-label="Etiqueta del spec" />
            <button type="button" className="admin-icon-button admin-icon-button--danger" onClick={() => onChange(specs.filter((_, specIndex) => specIndex !== index))} aria-label="Eliminar spec">
              <FiTrash2 aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function galleryAssetId(asset: MediaAsset, index: number) {
  return asset.storagePath ?? asset.src ?? `gallery-${index}`;
}

interface SortableGalleryItemProps {
  id: string;
  asset: MediaAsset;
  index: number;
  locale: Locale;
  isUploading: boolean;
  onSetMain: () => void;
  onDelete: () => void;
  onAltChange: (value: string) => void;
}

function SortableGalleryItem({ id, asset, index, locale, isUploading, onSetMain, onDelete, onAltChange }: SortableGalleryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: isUploading });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const isMain = index === 0;

  return (
    <article ref={setNodeRef} style={style} className={`admin-gallery-item ${isMain ? "is-main" : ""} ${isDragging ? "is-dragging" : ""}`}>
      <div className="admin-gallery-item__meta">
        <span className="admin-gallery-item__position">Foto {index + 1}</span>
        <span className="admin-gallery-item__handle" {...attributes} {...listeners} title="Arrastra para reordenar" aria-label="Arrastra para reordenar">
          <FiMove aria-hidden="true" /> Arrastra
        </span>
      </div>
      <div className="admin-gallery-item__preview">
        {isMain ? <span className="admin-gallery-item__badge">Principal</span> : null}
        {asset.src ? <MediaImage asset={asset} locale={locale} sizes="80px" /> : <FiImage aria-hidden="true" />}
      </div>
      <div className="admin-gallery-item__fields">
        <TextField label={`Alt (${locale.toUpperCase()})`} value={getLocalizedValue(asset.alt, locale)} onChange={onAltChange} />
        <small className="admin-gallery-item__hint">
          {isMain ? "Imagen de portada activa." : "Disponible en la galeria publica."}
        </small>
      </div>
      <div className="admin-gallery-item__actions">
        <button
          type="button"
          className={`admin-gallery-item__action ${isMain ? "is-active" : ""}`}
          onClick={onSetMain}
          disabled={isMain || isUploading}
          aria-label="Marcar como imagen principal"
          title="Hacer principal (mover al inicio)"
        >
          <FiStar aria-hidden="true" />
          <span>{isMain ? "Portada" : "Hacer portada"}</span>
        </button>
        <button
          type="button"
          className="admin-gallery-item__action admin-gallery-item__action--danger"
          onClick={onDelete}
          disabled={isUploading}
          aria-label="Eliminar imagen"
          title="Eliminar"
        >
          <FiTrash2 aria-hidden="true" />
          <span>Eliminar</span>
        </button>
      </div>
    </article>
  );
}

function MediaEditor({ image, gallery, locale, itemLabel, onChange }: { image: MediaAsset; gallery: MediaAsset[]; locale: Locale; itemLabel?: string; onChange: (image: MediaAsset, gallery: MediaAsset[]) => void }) {
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadTone, setUploadTone] = useState<FeedbackTone>("info");
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const assets = gallery.length > 0 ? gallery : image.src.trim() ? [image] : [];
  const visibleImageCount = assets.filter((asset) => asset.src).length;
  const gallerySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function updateQueueItem(id: string, patch: Partial<UploadQueueItem>) {
    setUploadQueue((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function commitGallery(nextGallery: MediaAsset[]) {
    const cleanedGallery = nextGallery.filter((asset) => asset.src.trim());
    onChange(cleanedGallery[0] ?? blankImage, cleanedGallery);
  }

  function updateAsset(index: number, patch: Partial<MediaAsset>) {
    const nextGallery = assets.map((asset, assetIndex) => (assetIndex === index ? { ...asset, ...patch } : asset));
    commitGallery(nextGallery);
  }

  function updateAssetAlt(index: number, value: string) {
    const asset = assets[index];

    updateAsset(index, {
      alt: {
        ...asset.alt,
        [locale]: value
      }
    });
  }

  function setMainImage(index: number) {
    if (isUploading) return;

    const asset = assets[index];
    const nextGallery = [asset, ...assets.filter((_, assetIndex) => assetIndex !== index)];

    onChange(asset, nextGallery);
    setUploadTone("info");
    setUploadStatus("Imagen principal actualizada. Pulsa \"Publicar en el sitio\" para aplicarla en la web.");
  }

  function reorderGallery(from: number, to: number) {
    if (from === to || isUploading) return;
    const newAssets = [...assets];
    const [moved] = newAssets.splice(from, 1);
    newAssets.splice(to, 0, moved);
    commitGallery(newAssets);
  }

  function handleGalleryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = assets.findIndex((asset, index) => galleryAssetId(asset, index) === active.id);
    const to = assets.findIndex((asset, index) => galleryAssetId(asset, index) === over.id);
    if (from >= 0 && to >= 0) reorderGallery(from, to);
  }

  async function deleteAsset(index: number) {
    if (isUploading) return;

    const asset = assets[index];

    if (asset.storagePath) {
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase.storage.from(supabaseGalleryBucket).remove([asset.storagePath]);
      } catch {
        setUploadStatus("La imagen se quito del contenido, pero no se pudo borrar el archivo del bucket.");
      }
    }

    commitGallery(assets.filter((_, assetIndex) => assetIndex !== index));
    setUploadTone("info");
    setUploadStatus("Imagen quitada. Pulsa \"Publicar en el sitio\" para aplicar el cambio en la web.");
  }

  async function uploadFiles(fileList: FileList | null) {
    if (isUploading) return;

    const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"));

    if (!files.length) {
      setUploadTone("error");
      setUploadStatus("Arrastra o selecciona archivos de imagen validos.");
      return;
    }

    const queueItems = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      status: "pending" as const,
      message: "En cola"
    }));

    setIsUploading(true);
    setUploadTone("info");
    setUploadQueue(queueItems);
    setUploadStatus(`Subiendo ${files.length} ${files.length === 1 ? "imagen" : "imagenes"} a Supabase Storage...`);

    try {
      const uploadedAssets: MediaAsset[] = [];
      const uploadErrors: string[] = [];
      const suggestedAlt = getSuggestedAlt(image.alt, itemLabel ?? "", locale);

      for (const [fileIndex, file] of files.entries()) {
        const queueItem = queueItems[fileIndex];

        updateQueueItem(queueItem.id, { status: "uploading", message: "Subiendo al bucket" });

        let uploadedAsset: MediaAsset;

        try {
          uploadedAsset = await uploadAdminStorageFile(file, "media");
        } catch (error) {
          const message = getUploadErrorMessage(error);

          uploadErrors.push(`${file.name}: ${message}`);
          updateQueueItem(queueItem.id, { status: "error", message });
          continue;
        }

        uploadedAssets.push({
          ...uploadedAsset,
          alt: suggestedAlt,
        });
        updateQueueItem(queueItem.id, { status: "done", message: "Lista para publicar" });
      }

      if (uploadedAssets.length) {
        const hasCustomImage = image.src !== defaultImage.src || gallery.some((asset) => asset.src !== defaultImage.src);
        const nextGallery = hasCustomImage ? [...assets, ...uploadedAssets] : uploadedAssets;

        onChange(nextGallery[0] ?? image, nextGallery);
      }

      if (uploadErrors.length) {
        setUploadTone("error");
        setUploadStatus(`${uploadedAssets.length} ${uploadedAssets.length === 1 ? "imagen subida" : "imagenes subidas"}; ${uploadErrors.length} con error. ${uploadErrors[0]}`);
        return;
      }

      setUploadTone("success");
      setUploadStatus(`${uploadedAssets.length} ${uploadedAssets.length === 1 ? "imagen subida" : "imagenes subidas"} a Storage. Pulsa "Publicar en el sitio" para que aparezcan en la web pública.`);
    } catch (error) {
      setUploadTone("error");
      setUploadStatus(error instanceof Error ? error.message : "No se pudieron subir las imagenes.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragActive(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    void uploadFiles(event.dataTransfer.files);
  }

  return (
    <section className="admin-subpanel">
      <div className="admin-panel-heading admin-panel-heading--compact">
        <h3><FiImage aria-hidden="true" /> Galería e imagen principal</h3>
        <span className="admin-pill">{visibleImageCount} {visibleImageCount === 1 ? "imagen" : "imagenes"}</span>
      </div>
      <label
        className={`admin-upload-dropzone ${isDragActive ? "is-drag-active" : ""} ${isUploading ? "is-uploading" : ""}`}
        aria-disabled={isUploading}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg className="admin-upload-dropzone__border" aria-hidden="true">
          <rect width="100%" height="100%" fill="none" />
        </svg>
        {isUploading ? <FiLoader aria-hidden="true" className="admin-spin" /> : <FiUploadCloud aria-hidden="true" />}
        <span>{isUploading ? "Subiendo fotos a Storage" : isDragActive ? "Suelta las fotos aqui" : "Arrastra fotos o haz clic para subir"}</span>
        <small>JPG, PNG, WebP o GIF. Las imágenes se suben inmediatamente a Storage; pulsa Guardar cambios para que aparezcan en la web.</small>
        <input type="file" accept="image/*" multiple disabled={isUploading} onChange={(event) => { void uploadFiles(event.target.files); event.target.value = ""; }} />
      </label>
      {/* Removed "Agregar URL" as per UX feedback - only direct uploads supported */}
      {uploadStatus ? (
        <div className={`admin-upload-status admin-upload-status--${uploadTone}`} role={uploadTone === "error" ? "alert" : "status"} aria-live="polite">
          <strong>{uploadStatus}</strong>
          {uploadQueue.length ? (
            <ul className="admin-upload-queue">
              {uploadQueue.map((item) => (
                <li key={item.id} className={`admin-upload-queue__item admin-upload-queue__item--${item.status}`}>
                  <span>{item.name}</span>
                  <small>{item.message}</small>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="admin-gallery-summary" aria-label="Guía rápida de la galería">
        <span><FiStar aria-hidden="true" /> La primera imagen se usa como portada.</span>
        <span><FiMove aria-hidden="true" /> Arrastra una card para cambiar el orden.</span>
      </div>
      <div className="admin-gallery-list">
        {!assets.length ? (
          <div className="admin-gallery-empty">
            <FiImage aria-hidden="true" />
            <span>Sube la imagen principal para este contenido.</span>
          </div>
        ) : null}
        <DndContext
          sensors={gallerySensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToParentElement]}
          onDragEnd={handleGalleryDragEnd}
        >
          <SortableContext items={assets.map((asset, index) => galleryAssetId(asset, index))} strategy={rectSortingStrategy}>
            {assets.map((asset, index) => {
              const id = galleryAssetId(asset, index);
              return (
                <SortableGalleryItem
                  key={id}
                  id={id}
                  asset={asset}
                  index={index}
                  locale={locale}
                  isUploading={isUploading}
                  onSetMain={() => setMainImage(index)}
                  onDelete={() => void deleteAsset(index)}
                  onAltChange={(value) => updateAssetAlt(index, value)}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}

function LocalizedTextEditor({ label, value, locale, onChange, multiline }: { label: string; value: LocalizedText; locale: Locale; onChange: (value: LocalizedText) => void; multiline?: boolean }) {
  const current = getLocalizedValue(value, locale);

  return multiline ? (
    <TextAreaField label={`${label} (${locale.toUpperCase()})`} value={current} onChange={(nextValue) => onChange({ ...value, [locale]: nextValue })} />
  ) : (
    <TextField label={`${label} (${locale.toUpperCase()})`} value={current} onChange={(nextValue) => onChange({ ...value, [locale]: nextValue })} />
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} />
    </label>
  );
}

function SeoPreview({ title, description, slug, html }: { title: string; description: string; slug: string; html: string }) {
  return (
    <section className="admin-preview">
      <div>
        <p className="admin-kicker"><FiEye aria-hidden="true" /> Vista previa SEO</p>
        <h3>{title}</h3>
        <span>fastservices.example/es/{slug}</span>
        <p>{description}</p>
      </div>
      <article className="admin-preview__body" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
