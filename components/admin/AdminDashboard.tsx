"use client";

import { type DragEvent, useMemo, useState, useTransition } from "react";
import type { IconType } from "react-icons";
import { FiAnchor, FiBriefcase, FiCopy, FiDroplet, FiExternalLink, FiEye, FiFileText, FiGlobe, FiHelpCircle, FiImage, FiLayers, FiLogOut, FiPlus, FiSave, FiSearch, FiStar, FiTrash2, FiTruck, FiUploadCloud } from "react-icons/fi";
import type { AdminMutationResult } from "@/app/admin/actions";
import { MediaImage } from "@/components/MediaImage";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { normalizeAdminContentSnapshot, type AdminContentKey, type AdminContentSnapshot } from "@/lib/admin/snapshot";
import { getLocalizedSlug, getLocalizedValue, locales, type Locale } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { supabaseGalleryBucket } from "@/lib/supabase/config";
import type { Boat, FaqItem, LocalizedText, MediaAsset, SeoPage, SpecItem } from "@/types/content";

type AdminItem = AdminContentSnapshot["content"][AdminContentKey][number];

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

const categorySlugsByCollection: Record<Boat["collectionId"], LocalizedText> = {
  "yachts-xl": { es: "yates-xl", en: "xl-yachts", de: "xl-yachten", nl: "xl-jachten" },
  yachts: { es: "yates", en: "yachts", de: "yachten", nl: "jachten" },
  "fast-boats": { es: "embarcaciones-rapidas", en: "fast-boats", de: "schnellboote", nl: "snelle-boten" }
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

function localized(value: string): LocalizedText {
  return { es: value, en: value, de: value, nl: value };
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

function touch<T extends AdminItem>(item: T): T {
  if ("updatedAt" in item) {
    return { ...item, updatedAt: new Date().toISOString().slice(0, 10) };
  }

  return item;
}

function getServicePageHref(snapshot: AdminContentSnapshot, serviceId: "boats" | "transfers" | "water-toys", locale: Locale) {
  const page = snapshot.content.servicePages.find((item) => item.serviceId === serviceId);
  return page ? `/${locale}/${getLocalizedSlug(page.slugsByLocale, locale)}` : null;
}

function isPublicServiceId(value: unknown): value is "boats" | "transfers" | "water-toys" {
  return value === "boats" || value === "transfers" || value === "water-toys";
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
  const [activeSection, setActiveSection] = useState<AdminContentKey>("boats");
  const [selectedId, setSelectedId] = useState(initialSnapshot.content.boats[0]?.id ?? "");
  const [locale, setLocale] = useState<Locale>("es");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState(initialMessage ?? (initialSource === "supabase" ? "Contenido cargado desde Supabase." : "Seed local cargado. Guarda en Supabase para migrarlo."));
  const [isSaving, startSaving] = useTransition();

  const section = sectionConfig.find((item) => item.key === activeSection) ?? sectionConfig[0];
  const SectionIcon = section.icon;
  const items = snapshot.content[activeSection] as AdminItem[];
  const filteredItems = items.filter((item) => `${getItemTitle(item, locale)} ${item.id}`.toLowerCase().includes(query.toLowerCase()));
  const selectedItem = items.find((item) => item.id === selectedId) ?? filteredItems[0] ?? items[0];
  const visitTarget = selectedItem ? getVisitTarget(activeSection, selectedItem, snapshot, locale) : null;

  const counters = useMemo(() => {
    const boats = snapshot.content.boats;
    const seoPages = snapshot.content.seoPages;
    const mediaCount = [
      ...snapshot.content.boats.flatMap((item) => [item.image, ...item.gallery]),
      ...snapshot.content.vehicles.flatMap((item) => [item.image, ...item.gallery]),
      ...snapshot.content.waterToys.flatMap((item) => [item.image, ...item.gallery]),
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

  function selectSection(key: AdminContentKey) {
    const nextItems = snapshot.content[key] as AdminItem[];
    setActiveSection(key);
    setSelectedId(nextItems[0]?.id ?? "");
    setQuery("");
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
    const newItem = activeSection === "boats" ? createBoat() : activeSection === "seoPages" ? createSeoPage() : selectedItem ? normalizeItemForActiveSection({ ...selectedItem, id: createId(activeSection) } as AdminItem) : null;

    if (!newItem) return;

    updateSnapshot(activeSection, (currentItems) => [newItem as AdminItem, ...currentItems]);
    setSelectedId(newItem.id);
    setMessage("Nuevo contenido creado en memoria. Exporta el JSON para conservarlo.");
  }

  function duplicateItem() {
    if (!selectedItem) return;

    const copy = touch(normalizeItemForActiveSection({ ...selectedItem, id: createId(activeSection) } as AdminItem));
    updateSnapshot(activeSection, (currentItems) => [copy, ...currentItems]);
    setSelectedId(copy.id);
    setMessage("Contenido duplicado en memoria.");
  }

  function deleteItem() {
    if (!selectedItem) return;
    const nextItems = items.filter((item) => item.id !== selectedItem.id);

    updateSnapshot(activeSection, () => nextItems);
    setSelectedId(nextItems[0]?.id ?? "");
    setMessage("Contenido eliminado del snapshot actual.");
  }

  function saveToSupabase() {
    startSaving(() => {
      void (async () => {
        const result = await saveSnapshotAction(snapshot);

        setMessage(result.message);

        if (result.ok && result.snapshot) {
          setSnapshot(result.snapshot);
        }
      })();
    });
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
            <p>{message}</p>
            <small className="admin-session-label">{adminEmail}</small>
          </div>
          <div className="admin-actions">
            <button type="button" className="admin-button admin-button--primary" onClick={saveToSupabase} disabled={isSaving}><FiSave aria-hidden="true" /> {isSaving ? "Guardando" : "Guardar Supabase"}</button>
            <form action={signOutAction}>
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

        <section className={`admin-workspace admin-workspace--${section.tone}`}>
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
              {filteredItems.map((item) => (
                <button type="button" key={item.id} className={item.id === selectedItem?.id ? "is-active" : ""} onClick={() => setSelectedId(item.id)}>
                  <span>{getItemTitle(item, locale)}</span>
                  <small>{getItemDescription(item, locale)}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="admin-editor-panel">
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
                      <a className="admin-button admin-button--ghost" href={visitTarget.href} target="_blank" rel="noreferrer" title="Abre la versión pública guardada">
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
    </div>
  );
}

function ItemEditor({ activeSection, item, locale, onChange }: { activeSection: AdminContentKey; item: AdminItem; locale: Locale; onChange: (patch: Partial<AdminItem>) => void }) {
  if (activeSection === "boats" && "kind" in item && item.kind === "boat") {
    return <BoatEditor boat={item} locale={locale} onChange={(patch) => onChange(patch as Partial<AdminItem>)} />;
  }

  if (activeSection === "seoPages" && "kind" in item && item.kind === "seoPage") {
    return <SeoPageEditor page={item} locale={locale} onChange={(patch) => onChange(patch as Partial<AdminItem>)} />;
  }

  if (activeSection === "faqs" && "question" in item) {
    return <FaqEditor faq={item} locale={locale} onChange={(patch) => onChange(patch as Partial<AdminItem>)} />;
  }

  return <GenericContentEditor item={item} locale={locale} onChange={onChange} />;
}

function BoatEditor({ boat, locale, onChange }: { boat: Boat; locale: Locale; onChange: (patch: Partial<Boat>) => void }) {
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
      <LocalizedTextEditor label="Slug por idioma" value={boat.slugsByLocale} locale={locale} onChange={(value) => onChange({ slugsByLocale: value })} />
      <LocalizedTextEditor label="Título SEO" value={boat.seoTitle} locale={locale} onChange={(value) => onChange({ seoTitle: value })} />
      <LocalizedTextEditor label="Descripción SEO" value={boat.seoDescription} locale={locale} multiline onChange={(value) => onChange({ seoDescription: value })} />
      <LocalizedTextEditor label="Precio / disponibilidad" value={boat.priceLabel ?? localized("")} locale={locale} onChange={(value) => onChange({ priceLabel: value })} />
      <SpecsEditor specs={boat.specs} locale={locale} onChange={(specs) => onChange({ specs })} />
      <MediaEditor image={boat.image} gallery={boat.gallery} locale={locale} onChange={(image, gallery) => onChange({ image, gallery })} />
      <LocalizedTextEditor label="Mensaje WhatsApp" value={boat.whatsappMessage} locale={locale} multiline onChange={(value) => onChange({ whatsappMessage: value })} />
    </div>
  );
}

function SeoPageEditor({ page, locale, onChange }: { page: SeoPage; locale: Locale; onChange: (patch: Partial<SeoPage>) => void }) {
  const richValue = page.body[locale] ?? page.body.es;

  async function uploadImageForBody(file: File): Promise<string> {
    const supabase = createSupabaseBrowserClient();
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const storagePath = `${new Date().getFullYear()}/${createId("body")}.${extension}`;
    const { error } = await supabase.storage.from(supabaseGalleryBucket).upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: false
    });
    if (error) throw error;
    const { data } = supabase.storage.from(supabaseGalleryBucket).getPublicUrl(storagePath);
    return data.publicUrl;
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
      <MediaEditor image={page.image} gallery={page.gallery} locale={locale} onChange={(image, gallery) => onChange({ image, gallery })} />
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
      <TextField label="Servicio asociado" value={faq.serviceId ?? ""} onChange={(value) => onChange({ serviceId: value ? value as FaqItem["serviceId"] : undefined })} />
    </div>
  );
}

function GenericContentEditor({ item, locale, onChange }: { item: AdminItem; locale: Locale; onChange: (patch: Partial<AdminItem>) => void }) {
  const title = "title" in item ? item.title : "description" in item ? item.description : undefined;

  return (
    <div className="admin-form">
      {title ? <LocalizedTextEditor label="Texto principal" value={title} locale={locale} multiline onChange={(value) => onChange("title" in item ? { title: value } as Partial<AdminItem> : { description: value } as Partial<AdminItem>)} /> : null}
      {"seoTitle" in item ? <LocalizedTextEditor label="Título SEO" value={item.seoTitle} locale={locale} onChange={(value) => onChange({ seoTitle: value } as Partial<AdminItem>)} /> : null}
      {"seoDescription" in item ? <LocalizedTextEditor label="Descripción SEO" value={item.seoDescription} locale={locale} multiline onChange={(value) => onChange({ seoDescription: value } as Partial<AdminItem>)} /> : null}
    </div>
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
          <div className="admin-spec-row" key={`${spec.label.es}-${index}`}>
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

function MediaEditor({ image, gallery, locale, onChange }: { image: MediaAsset; gallery: MediaAsset[]; locale: Locale; onChange: (image: MediaAsset, gallery: MediaAsset[]) => void }) {
  const [uploadStatus, setUploadStatus] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const assets = gallery.length ? gallery : [image];

  function commitGallery(nextGallery: MediaAsset[]) {
    const cleanedGallery = nextGallery.filter((asset) => asset.src.trim());
    onChange(cleanedGallery[0] ?? defaultImage, cleanedGallery);
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
    const src = window.prompt("Pega la URL de la imagen");
    if (!src?.trim()) return;

    commitGallery([
      ...assets,
      {
        src: src.trim(),
        alt: image.alt,
        source: "local"
      }
    ]);
  }

  function setMainImage(index: number) {
    const asset = assets[index];
    const nextGallery = [asset, ...assets.filter((_, assetIndex) => assetIndex !== index)];

    onChange(asset, nextGallery);
  }

  async function deleteAsset(index: number) {
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
  }

  async function uploadFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"));

    if (!files.length) {
      setUploadStatus("Arrastra o selecciona archivos de imagen validos.");
      return;
    }

    setUploadStatus("Subiendo imagenes...");

    try {
      const supabase = createSupabaseBrowserClient();
      const uploadedAssets: MediaAsset[] = [];

      for (const file of files) {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const storagePath = `${new Date().getFullYear()}/${createId("media")}.${extension}`;
        const { error } = await supabase.storage.from(supabaseGalleryBucket).upload(storagePath, file, {
          cacheControl: "31536000",
          contentType: file.type || undefined,
          upsert: false
        });

        if (error) throw error;

        const { data } = supabase.storage.from(supabaseGalleryBucket).getPublicUrl(storagePath);

        uploadedAssets.push({
          src: data.publicUrl,
          alt: image.alt,
          source: "supabase",
          storagePath
        });
      }

      const hasCustomImage = image.src !== defaultImage.src || gallery.some((asset) => asset.src !== defaultImage.src);
      const nextGallery = hasCustomImage ? [...assets, ...uploadedAssets] : uploadedAssets;

      onChange(nextGallery[0] ?? image, nextGallery);
      setUploadStatus(`${uploadedAssets.length} imagenes subidas a Supabase Storage.`);
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "No se pudieron subir las imagenes.");
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
        <span className="admin-pill">{assets.filter((asset) => asset.src).length} imagenes</span>
      </div>
      <label
        className={`admin-upload-dropzone ${isDragActive ? "is-drag-active" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FiUploadCloud aria-hidden="true" />
        <span>{isDragActive ? "Suelta las fotos aqui" : "Arrastra fotos o haz clic para subir"}</span>
        <small>JPG, PNG, WebP o GIF. Se guardan en el bucket de galeria.</small>
        <input type="file" accept="image/*" multiple onChange={(event) => uploadFiles(event.target.files)} />
      </label>
      <div className="admin-actions admin-actions--compact">
        <button type="button" className="admin-button admin-button--ghost" onClick={addImageUrl}><FiPlus aria-hidden="true" /> Agregar URL</button>
      </div>
      {uploadStatus ? <p className="admin-upload-status">{uploadStatus}</p> : null}
      <div className="admin-gallery-list">
        {assets.map((asset, index) => (
          <article className="admin-gallery-item" key={`${asset.src}-${index}`}>
            <div className="admin-gallery-item__preview">
              {asset.src ? <MediaImage asset={asset} locale={locale} sizes="180px" /> : <FiImage aria-hidden="true" />}
            </div>
            <div className="admin-gallery-item__fields">
              <TextField label={index === 0 ? "URL imagen principal" : "URL imagen"} value={asset.src} onChange={(value) => updateAsset(index, { src: value })} />
              <TextField label={`Alt (${locale.toUpperCase()})`} value={getLocalizedValue(asset.alt, locale)} onChange={(value) => updateAssetAlt(index, value)} />
            </div>
            <div className="admin-gallery-item__actions">
              <button type="button" className="admin-icon-button" onClick={() => setMainImage(index)} disabled={index === 0} aria-label="Marcar como imagen principal">
                <FiStar aria-hidden="true" />
              </button>
              <button type="button" className="admin-icon-button admin-icon-button--danger" onClick={() => deleteAsset(index)} aria-label="Eliminar imagen">
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
