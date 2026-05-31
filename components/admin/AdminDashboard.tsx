"use client";

import { type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FiAlertCircle, FiAnchor, FiBriefcase, FiCheckCircle, FiChevronLeft, FiCopy, FiDroplet, FiExternalLink, FiEye, FiFileText, FiGlobe, FiHelpCircle, FiImage, FiLayers, FiLoader, FiLogOut, FiPlus, FiSave, FiSearch, FiStar, FiTrash2, FiTruck, FiUploadCloud, FiVideo } from "react-icons/fi";
import type { AdminMutationResult } from "@/app/admin/actions";
import { MediaImage } from "@/components/MediaImage";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { normalizeAdminContentSnapshot, type AdminContentKey, type AdminContentSnapshot } from "@/lib/admin/snapshot";
import { getLocalizedSlug, getLocalizedValue, locales, type Locale } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { supabaseGalleryBucket } from "@/lib/supabase/config";
import type { Boat, BoatCollection, FaqItem, LocalizedText, MediaAsset, RichTextByLocale, SeoPage, ServiceOption, ServicePage, SpecItem, Vehicle, VideoAsset, WaterToy } from "@/types/content";

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
  { key: "faqs", label: "FAQs", description: "Preguntas frecuentes por servicio", icon: FiHelpCircle, tone: "faqs" }
] satisfies Array<{ key: AdminContentKey; label: string; description: string; icon: IconType; tone: string }>;

const defaultImage: MediaAsset = {
  src: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1200&q=80",
  alt: { es: "Imagen del contenido en Ibiza", en: "Content image in Ibiza" },
  source: "unsplash"
};

const blankImage: MediaAsset = { src: "", alt: { es: "", en: "", de: "", nl: "" }, source: "local" };

const categorySlugsByCollection: Record<Boat["collectionId"], LocalizedText> = {
  "yachts-xl": { es: "yates-xl", en: "xl-yachts", de: "xl-yachten", nl: "xl-jachten" },
  yachts: { es: "yates", en: "yachts", de: "yachten", nl: "jachten" },
  "fast-boats": { es: "embarcaciones-rapidas", en: "fast-boats", de: "schnellboote", nl: "snelle-boten" }
};

const requiredSaveLocales = ["es", "en"] as const satisfies Locale[];

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
    message: initialMessage ?? "Seed local cargado. Guarda en Supabase para migrarlo."
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
    const slug = getDirectLocalizedValue(slugsByLocale, saveLocale);

    if (!slug) {
      errors.push(`${label}: completa el slug ${saveLocale.toUpperCase()}.`);
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
      errors.push(`${label}: cambia el nombre visible antes de guardar.`);
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
  snapshot.content.servicePages.forEach((page, index) => {
    const label = getLocalizedValue(page.title, "es").trim() || page.id || `Servicio ${index + 1}`;

    validateLocalizedSlug(errors, serviceSlugKeys, label, page.slugsByLocale, "servicePages");
    validatePrimaryImage(errors, label, page);

    page.options?.forEach((option, optionIndex) => {
      const optionLabel = getLocalizedValue(option.name, "es").trim() || option.id || `Opcion ${optionIndex + 1}`;

      validatePrimaryImage(errors, `${label} / ${optionLabel}`, option);
    });
  });

  if (errors.length <= 8) return errors;

  return [...errors.slice(0, 8), `Hay ${errors.length - 8} avisos mas. Corrige los primeros y vuelve a guardar.`];
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
  if ("seoDescription" in item) return getLocalizedValue(item.seoDescription, locale);
  if ("answer" in item) return getLocalizedValue(item.answer, locale);
  return "Contenido preparado para edición";
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
  return value === "boats" || value === "transfers" || value === "water-toys" || value === "security" || value === "self-drive";
}

function getVisitTarget(activeSection: AdminContentKey, item: AdminItem, snapshot: AdminContentSnapshot, locale: Locale) {
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
    whatsappMessage: localized("Hola, quiero consultar esta colección de barcos en Ibiza.")
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

function createServicePage(): ServicePage {
  const id = createId("service");
  const date = new Date().toISOString().slice(0, 10);

  return {
    id,
    kind: "service",
    serviceId: id,
    status: "published",
    visibility: "listed",
    robotsIndex: true,
    slugsByLocale: localized(id),
    title: localized("Nuevo servicio"),
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
    seoTitle: localized("Nuevo servicio en Ibiza"),
    seoDescription: localized("Descripción SEO del nuevo servicio en Ibiza."),
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
}

export function AdminDashboard({ initialSnapshot, initialSource, initialMessage, adminEmail, saveSnapshotAction, signOutAction }: AdminDashboardProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [lastSavedFingerprint, setLastSavedFingerprint] = useState(() => snapshotFingerprint(initialSnapshot));
  const [activeSection, setActiveSection] = useState<AdminContentKey>("boats");
  const [selectedId, setSelectedId] = useState(initialSnapshot.content.boats[0]?.id ?? "");
  const [mobileView, setMobileView] = useState<"list" | "editor">("list");
  const [locale, setLocale] = useState<Locale>("es");
  const [query, setQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState<AdminSaveStatus>(() => getInitialSaveStatus(initialSource, initialMessage));
  const [isSaving, setIsSaving] = useState(false);
  const saveStatusRef = useRef<HTMLDivElement>(null);

  const section = sectionConfig.find((item) => item.key === activeSection) ?? sectionConfig[0];
  const SectionIcon = section.icon;
  const items = snapshot.content[activeSection] as AdminItem[];
  const filteredItems = items.filter((item) => `${getItemTitle(item, locale)} ${item.id}`.toLowerCase().includes(query.toLowerCase()));
  const selectedItem = items.find((item) => item.id === selectedId) ?? filteredItems[0] ?? items[0];
  const visitTarget = selectedItem ? getVisitTarget(activeSection, selectedItem, snapshot, locale) : null;
  const SaveStatusIcon = isSaving ? FiLoader : saveStatus.tone === "success" ? FiCheckCircle : saveStatus.tone === "error" ? FiAlertCircle : FiSave;
  const currentFingerprint = useMemo(() => snapshotFingerprint(snapshot), [snapshot]);
  const hasUnsavedChanges = currentFingerprint !== lastSavedFingerprint;

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
    const boats = snapshot.content.boats;
    const seoPages = snapshot.content.seoPages;
    const mediaCount = [
      ...snapshot.content.boats.flatMap((item) => [item.image, ...item.gallery]),
      ...snapshot.content.vehicles.flatMap((item) => [item.image, ...item.gallery]),
      ...snapshot.content.waterToys.flatMap((item) => [item.image, ...item.gallery]),
      ...snapshot.content.servicePages.flatMap((item) => [item.image, ...(item.gallery ?? [])]),
      ...seoPages.flatMap((item) => [item.image, ...item.gallery])
    ].length;

    const collections = snapshot.content.boatCollections;

    return [
      { label: "Barcos", value: boats.length, note: "rutas indexables" },
      { label: "Colecciones", value: collections.length, note: "categorías de barcos" },
      { label: "SEO ocultas", value: seoPages.length, note: "fuera del menú" },
      { label: "Imágenes", value: mediaCount, note: "con alt por idioma" }
    ];
  }, [snapshot]);

  function confirmDiscardUnsavedChanges() {
    if (!hasUnsavedChanges) return true;

    return window.confirm("Tienes cambios sin guardar. Si sales ahora, se perderan. ¿Quieres continuar sin guardar?");
  }

  function selectSection(key: AdminContentKey) {
    const nextItems = snapshot.content[key] as AdminItem[];
    setActiveSection(key);
    setSelectedId(nextItems[0]?.id ?? "");
    setMobileView("list");
    setQuery("");
  }

  function selectItem(id: string) {
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

    updateSnapshot(activeSection, (currentItems) => currentItems.map((item) => (item.id === selectedItem.id ? touch({ ...item, ...patch } as AdminItem) : item)));
  }

  function normalizeItemForActiveSection(item: AdminItem) {
    const normalized = normalizeAdminContentSnapshot({
      ...snapshot,
      content: {
        ...snapshot.content,
        [activeSection]: [item] as never
      }
    });

    return (normalized.content[activeSection] as AdminItem[])[0];
  }

  function addItem() {
    const newItem = normalizeItemForActiveSection(createItemForSection(activeSection));

    updateSnapshot(activeSection, (currentItems) => [newItem as AdminItem, ...currentItems]);
    selectItem(newItem.id);
    setSaveStatus({
      tone: "info",
      title: "Contenido creado en memoria",
      message: "Completa los campos clave y guarda en Supabase para publicarlo."
    });
  }

  function duplicateItem() {
    if (!selectedItem) return;

    const copy = touch(normalizeItemForActiveSection({ ...selectedItem, id: createId(activeSection) } as AdminItem));
    updateSnapshot(activeSection, (currentItems) => [copy, ...currentItems]);
    selectItem(copy.id);
    setSaveStatus({
      tone: "info",
      title: "Contenido duplicado en memoria",
      message: "Revisa slug, imagen y textos antes de guardar en Supabase."
    });
  }

  function deleteItem() {
    if (!selectedItem) return;

    if (!window.confirm(`Eliminar "${getItemTitle(selectedItem, locale)}"? Guarda en Supabase despues para aplicar el borrado.`)) {
      return;
    }

    const nextItems = items.filter((item) => item.id !== selectedItem.id);

    updateSnapshot(activeSection, () => nextItems);
    setSelectedId(nextItems[0]?.id ?? "");
    setMobileView("list");
    setSaveStatus({
      tone: "info",
      title: "Contenido eliminado en memoria",
      message: "Guarda en Supabase para aplicar el borrado en la web publica."
    });
  }

  async function saveToSupabase() {
    if (isSaving) return;

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

    setIsSaving(true);
    setSaveStatus({
      tone: "info",
      title: "Guardando en Supabase",
      message: "Publicando contenido, imagenes y rutas para que el frontend use los datos actualizados."
    });

    try {
      const result = await saveSnapshotAction(snapshot);

      setSaveStatus({
        tone: result.ok ? "success" : "error",
        title: result.ok ? "Contenido publicado" : "No se pudo guardar",
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

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Secciones del administrador">
        <div className="admin-sidebar__brand">
          <span>FAST</span>
          <strong>Admin</strong>
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
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">Panel preparado para Supabase</p>
            <h1>Administrador de contenido</h1>
            <small className="admin-session-label">{adminEmail}</small>
          </div>
          <div
            ref={saveStatusRef}
            className={`admin-save-status admin-save-status--${saveStatus.tone}`}
            role={saveStatus.tone === "error" ? "alert" : "status"}
            aria-live="polite"
            tabIndex={-1}
          >
            <span className="admin-save-status__icon">
              <SaveStatusIcon aria-hidden="true" className={isSaving ? "admin-spin" : undefined} />
            </span>
            <div>
              <strong>{isSaving ? "Guardando en Supabase" : saveStatus.title}</strong>
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
          <div className="admin-actions">
            {hasUnsavedChanges ? <span className="admin-unsaved-pill">Cambios sin guardar</span> : null}
            <button type="button" className="admin-button admin-button--primary" onClick={() => void saveToSupabase()} disabled={isSaving} aria-busy={isSaving}>
              {isSaving ? <FiLoader aria-hidden="true" className="admin-spin" /> : <FiSave aria-hidden="true" />} {isSaving ? "Guardando" : "Guardar Supabase"}
            </button>
            <form
              action={signOutAction}
              onSubmit={(event) => {
                if (!confirmDiscardUnsavedChanges()) event.preventDefault();
              }}
            >
              <button type="submit" className="admin-button admin-button--ghost"><FiLogOut aria-hidden="true" /> Salir</button>
            </form>
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
          <div className="admin-list-panel">
            <div className="admin-panel-heading">
              <span className="admin-heading-icon">
                <SectionIcon aria-hidden="true" />
              </span>
              <div>
                <p className="admin-kicker">{section.label}</p>
                <h2>{section.description}</h2>
              </div>
              <button type="button" className="admin-icon-button" onClick={addItem} aria-label="Crear contenido">
                <FiPlus aria-hidden="true" />
              </button>
            </div>
            <label className="admin-search">
              <FiSearch aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título o ID" />
            </label>
            <div className="admin-list">
              {filteredItems.map((item) => {
                const itemVisitTarget = getVisitTarget(activeSection, item, snapshot, locale);

                return (
                  <article key={item.id} className={`admin-list-item ${item.id === selectedItem?.id ? "is-active" : ""}`}>
                    <button type="button" className="admin-list-item__select" onClick={() => selectItem(item.id)}>
                      <span>{getItemTitle(item, locale)}</span>
                      <small>{getItemDescription(item, locale)}</small>
                    </button>
                    {itemVisitTarget ? (
                      <a className="admin-list-item__visit" href={itemVisitTarget.href} target="_blank" rel="noreferrer" title="Ver página pública" onClick={(event) => { if (!confirmDiscardUnsavedChanges()) event.preventDefault(); }}>
                        <FiExternalLink aria-hidden="true" />
                        <span>Ver</span>
                      </a>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="admin-editor-panel">
            <button type="button" className="admin-back-button" onClick={() => setMobileView("list")} aria-label="Volver a la lista">
              <FiChevronLeft aria-hidden="true" /> Lista
            </button>
            {selectedItem ? (
              <>
                <div className="admin-editor-toolbar">
                  <div className="admin-locale-tabs" aria-label="Idioma de edición">
                    {locales.map((item) => (
                      <button type="button" key={item} className={item === locale ? "is-active" : ""} onClick={() => setLocale(item)}>{item.toUpperCase()}</button>
                    ))}
                  </div>
                  <div className="admin-actions admin-actions--compact">
                    {visitTarget ? (
                      <a className="admin-button admin-button--ghost" href={visitTarget.href} target="_blank" rel="noreferrer" title="Abre la versión pública guardada" onClick={(event) => { if (!confirmDiscardUnsavedChanges()) event.preventDefault(); }}>
                        <FiExternalLink aria-hidden="true" /> {visitTarget.label}
                      </a>
                    ) : null}
                    <button type="button" className="admin-button admin-button--ghost" onClick={duplicateItem}><FiCopy aria-hidden="true" /> Duplicar</button>
                    <button type="button" className="admin-button admin-button--danger" onClick={deleteItem}><FiTrash2 aria-hidden="true" /> Eliminar</button>
                  </div>
                </div>

                <ItemEditor activeSection={activeSection} item={selectedItem} locale={locale} onChange={updateSelectedItem} />
              </>
            ) : (
              <div className="admin-empty-state">
                <FiFileText aria-hidden="true" />
                <h2>No hay contenido todavía</h2>
                <p>Crea un elemento para empezar.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <nav className="admin-bottom-nav" aria-label="Navegación de secciones">
        {sectionConfig.map((item) => {
          const NavIcon = item.icon;

          return (
            <button
              type="button"
              key={item.key}
              className={`admin-bottom-nav__item${item.key === activeSection ? " is-active" : ""}`}
              onClick={() => selectSection(item.key)}
              aria-label={item.label}
            >
              <span className={`admin-section-icon admin-section-icon--${item.tone}`}>
                <NavIcon aria-hidden="true" />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function ItemEditor({ activeSection, item, locale, onChange }: { activeSection: AdminContentKey; item: AdminItem; locale: Locale; onChange: (patch: Partial<AdminItem>) => void }) {
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
      <div className="admin-form-grid admin-form-grid--three">
        <label className="admin-field">
          <span>Tipo de colección</span>
          <select value={collection.collectionId} onChange={(event) => onChange({ collectionId: event.target.value as BoatCollection["collectionId"] })}>
            <option value="yachts-xl">Yates XL</option>
            <option value="yachts">Yates</option>
            <option value="fast-boats">Embarcaciones rápidas</option>
          </select>
        </label>
        <TextField label="Objetivo de barcos" value={String(collection.countTarget ?? 0)} onChange={(value) => onChange({ countTarget: Number.parseInt(value, 10) || 0 })} />
        <label className="admin-check-field">
          <input type="checkbox" checked={collection.hiddenPage} onChange={(event) => onChange({ hiddenPage: event.target.checked })} />
          <span>Página oculta en menú</span>
        </label>
      </div>
      <MediaEditor image={collection.image} gallery={[]} locale={locale} itemLabel={getLocalizedValue(collection.title, locale)} onChange={(image) => onChange({ image })} />
      <LocalizedTextEditor label="Título" value={collection.title} locale={locale} onChange={(value) => onChange({ title: value })} />
      <LocalizedTextEditor label="Eyebrow" value={collection.eyebrow} locale={locale} onChange={(value) => onChange({ eyebrow: value })} />
      <LocalizedTextEditor label="Descripción" value={collection.description} locale={locale} multiline onChange={(value) => onChange({ description: value })} />
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

  return (
    <div className="admin-form">
      <TextField label="ID interno del servicio" value={page.serviceId} onChange={(value) => onChange({ serviceId: value.trim() || page.id })} />
      <LocalizedTextEditor label="Título H1" value={page.title} locale={locale} onChange={(value) => onChange({ title: value })} />
      <LocalizedTextEditor label="Eyebrow" value={page.eyebrow} locale={locale} onChange={(value) => onChange({ eyebrow: value })} />
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
      <ServiceOptionsEditor
        serviceId={page.serviceId}
        options={page.options ?? []}
        locale={locale}
        onChange={(options) => onChange({ options })}
      />
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
                gallery={[]}
                locale={locale}
                itemLabel={optionLabel}
                onChange={(image) => updateOption(index, { image })}
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
      <LocalizedTextEditor label="Eyebrow" value={page.eyebrow} locale={locale} onChange={(value) => onChange({ eyebrow: value })} />
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
          <div className="admin-amenity-row" key={index}>
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
      setStatus("Video subido. Pulsa Guardar Supabase para publicarlo en la web.");
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
    setStatus("Video quitado. Guarda en Supabase para aplicar el cambio.");
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
          <div className="admin-spec-row" key={index}>
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

function MediaEditor({ image, gallery, locale, itemLabel, onChange }: { image: MediaAsset; gallery: MediaAsset[]; locale: Locale; itemLabel?: string; onChange: (image: MediaAsset, gallery: MediaAsset[]) => void }) {
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadTone, setUploadTone] = useState<FeedbackTone>("info");
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const assets = gallery.length > 0 ? gallery : image.src.trim() ? [image] : [];
  const visibleImageCount = assets.filter((asset) => asset.src).length;

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

  function addImageUrl() {
    if (isUploading) return;

    const src = window.prompt("Pega la URL de la imagen");
    if (!src?.trim()) return;

    commitGallery([
      ...assets,
      {
        src: src.trim(),
        alt: getSuggestedAlt(image.alt, itemLabel ?? "", locale),
        source: "local"
      }
    ]);
    setUploadTone("info");
    setUploadStatus("URL agregada al contenido. Pulsa Guardar Supabase para publicarla en la web.");
  }

  function setMainImage(index: number) {
    if (isUploading) return;

    const asset = assets[index];
    const nextGallery = [asset, ...assets.filter((_, assetIndex) => assetIndex !== index)];

    onChange(asset, nextGallery);
    setUploadTone("info");
    setUploadStatus("Imagen principal actualizada en memoria. Guarda en Supabase para publicarla.");
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
    setUploadStatus("Imagen quitada del contenido. Guarda en Supabase para aplicar el cambio.");
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
      setUploadStatus(`${uploadedAssets.length} ${uploadedAssets.length === 1 ? "imagen subida" : "imagenes subidas"} a Storage. Pulsa Guardar Supabase para publicarlas en la web.`);
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
        {isUploading ? <FiLoader aria-hidden="true" className="admin-spin" /> : <FiUploadCloud aria-hidden="true" />}
        <span>{isUploading ? "Subiendo fotos a Storage" : isDragActive ? "Suelta las fotos aqui" : "Arrastra fotos o haz clic para subir"}</span>
        <small>JPG, PNG, WebP o GIF. La subida guarda el archivo; el boton Guardar Supabase publica el contenido.</small>
        <input type="file" accept="image/*" multiple disabled={isUploading} onChange={(event) => { void uploadFiles(event.target.files); event.target.value = ""; }} />
      </label>
      <div className="admin-actions admin-actions--compact">
        <button type="button" className="admin-button admin-button--ghost" onClick={addImageUrl} disabled={isUploading}><FiPlus aria-hidden="true" /> Agregar URL</button>
      </div>
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
      <div className="admin-gallery-list">
        {!assets.length ? (
          <div className="admin-gallery-empty">
            <FiImage aria-hidden="true" />
            <span>Sube la imagen principal para este contenido.</span>
          </div>
        ) : null}
        {assets.map((asset, index) => (
          <article className={`admin-gallery-item ${index === 0 ? "is-main" : ""}`} key={asset.storagePath ?? asset.src}>
            <div className="admin-gallery-item__preview">
              {index === 0 ? <span className="admin-gallery-item__badge">Principal</span> : null}
              {asset.src ? <MediaImage asset={asset} locale={locale} sizes="180px" /> : <FiImage aria-hidden="true" />}
            </div>
            <div className="admin-gallery-item__fields">
              <TextField label={index === 0 ? "URL imagen principal" : "URL imagen"} value={asset.src} onChange={(value) => updateAsset(index, { src: value })} />
              <TextField label={`Alt (${locale.toUpperCase()})`} value={getLocalizedValue(asset.alt, locale)} onChange={(value) => updateAssetAlt(index, value)} />
            </div>
            <div className="admin-gallery-item__actions">
              <button type="button" className="admin-icon-button" onClick={() => setMainImage(index)} disabled={index === 0 || isUploading} aria-label="Marcar como imagen principal">
                <FiStar aria-hidden="true" />
              </button>
              <button type="button" className="admin-icon-button admin-icon-button--danger" onClick={() => deleteAsset(index)} disabled={isUploading} aria-label="Eliminar imagen">
                <FiTrash2 aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
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
