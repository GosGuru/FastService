"use client";

import { useMemo, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiAlertCircle, FiCheckCircle, FiChevronDown, FiChevronUp, FiExternalLink, FiGrid, FiHome, FiLoader, FiMove, FiPlus, FiSave, FiSearch, FiX } from "react-icons/fi";
import { MediaImage } from "@/components/MediaImage";
import { getLocalizedValue, locales, type Locale } from "@/lib/i18n";
import { validateHomeSettings } from "@/lib/homeSettings";
import type { Boat, BoatCollection, BoatCollectionId, LocalizedText } from "@/types/content";
import type { SiteSettings } from "@/types/settings";

interface SaveStatus {
  tone: "info" | "success" | "error";
  title: string;
  message: string;
  details?: string[];
}

interface HomeSettingsEditorProps {
  settings: SiteSettings;
  boats: Boat[];
  collections: BoatCollection[];
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onChange: (settings: SiteSettings) => void;
  onSave: () => void;
  saveStatus: SaveStatus;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

const collectionLabels: Record<BoatCollectionId, string> = {
  "fast-boats": "Embarcaciones rápidas",
  yachts: "Yates",
  "yachts-xl": "Yates XL"
};

function SortableRow({
  id,
  image,
  title,
  eyebrow,
  index,
  total,
  onMove,
  onRemove
}: {
  id: string;
  image: React.ReactNode;
  title: string;
  eyebrow: string;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onRemove?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <article ref={setNodeRef} className={`home-admin-sortable ${isDragging ? "is-dragging" : ""}`} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <button type="button" className="home-admin-sortable__handle" aria-label={`Reordenar ${title}`} {...attributes} {...listeners}>
        <FiMove aria-hidden="true" />
      </button>
      <div className="home-admin-sortable__media">{image}</div>
      <div className="home-admin-sortable__copy">
        <span>{eyebrow}</span>
        <strong>{title}</strong>
      </div>
      <div className="home-admin-sortable__actions">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Subir ${title}`}><FiChevronUp /></button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} aria-label={`Bajar ${title}`}><FiChevronDown /></button>
        {onRemove ? <button type="button" className="is-danger" onClick={onRemove} aria-label={`Quitar ${title}`}><FiX /></button> : null}
      </div>
    </article>
  );
}

function LocaleTabs({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return (
    <div className="home-admin-locales" aria-label="Idioma de edición">
      {locales.map((item) => (
        <button type="button" key={item} className={item === locale ? "is-active" : ""} onClick={() => onChange(item)}>{item.toUpperCase()}</button>
      ))}
    </div>
  );
}

export function HomeSettingsEditor({ settings, boats, collections, locale, onLocaleChange, onChange, onSave, saveStatus, isSaving, hasUnsavedChanges }: HomeSettingsEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState<BoatCollectionId | "all">("all");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const visibleBoats = useMemo(() => boats.filter((boat) => boat.visibility !== "hidden"), [boats]);
  const boatsById = useMemo(() => new Map(boats.map((boat) => [boat.id, boat])), [boats]);
  const collectionsById = useMemo(() => new Map(collections.map((collection) => [collection.collectionId, collection])), [collections]);
  const selectedBoats = settings.home.featured.boatIds.flatMap((id) => {
    const boat = boatsById.get(id);
    return boat ? [boat] : [];
  });
  const filteredBoats = visibleBoats.filter((boat) => {
    const searchValue = `${boat.id} ${boat.name}`.toLocaleLowerCase();
    return (collectionFilter === "all" || boat.collectionId === collectionFilter) && searchValue.includes(query.trim().toLocaleLowerCase());
  });
  const validationErrors = validateHomeSettings(settings, boats, collections);

  function updateLocalized(path: "hero.title" | "hero.description" | "featured.title" | "featured.description" | "categories.title", value: string) {
    const [section, field] = path.split(".") as ["hero" | "featured" | "categories", string];
    const currentSection = settings.home[section] as Record<string, unknown>;
    const localized = currentSection[field] as LocalizedText;
    onChange({
      ...settings,
      home: { ...settings.home, [section]: { ...currentSection, [field]: { ...localized, [locale]: value } } }
    });
  }

  function setBoatIds(boatIds: string[]) {
    onChange({ ...settings, home: { ...settings.home, featured: { ...settings.home.featured, boatIds } } });
  }

  function setCollectionIds(collectionIds: BoatCollectionId[]) {
    onChange({ ...settings, home: { ...settings.home, categories: { ...settings.home.categories, collectionIds } } });
  }

  function reorder(ids: string[], activeId: string, overId: string) {
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    return oldIndex >= 0 && newIndex >= 0 ? arrayMove(ids, oldIndex, newIndex) : ids;
  }

  function handleBoatDrag({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) setBoatIds(reorder(settings.home.featured.boatIds, String(active.id), String(over.id)));
  }

  function handleCollectionDrag({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) setCollectionIds(reorder(settings.home.categories.collectionIds, String(active.id), String(over.id)) as BoatCollectionId[]);
  }

  function toggleBoat(id: string) {
    const selected = settings.home.featured.boatIds;
    if (selected.includes(id)) setBoatIds(selected.filter((boatId) => boatId !== id));
    else if (selected.length < 4) setBoatIds([...selected, id]);
  }

  return (
    <div className="home-admin-editor">
      <header className="home-admin-editor__header">
        <div>
          <span className="home-admin-editor__kicker"><FiHome /> Página pública</span>
          <h2>Inicio</h2>
          <p>Editá el contenido principal sin cambiar el diseño actual.</p>
        </div>
        <div className="home-admin-editor__header-actions">
          <a className="admin-button admin-button--view" href={`/${locale}`} target="_blank" rel="noreferrer"><FiExternalLink /> Ver página</a>
          <button type="button" className="admin-button admin-button--primary" onClick={onSave} disabled={isSaving || validationErrors.length > 0}>
            {isSaving ? <FiLoader className="admin-spin" /> : <FiSave />} {isSaving ? "Publicando" : "Publicar inicio"}
          </button>
        </div>
      </header>

      <div className={`home-admin-sync home-admin-sync--${isSaving ? "saving" : hasUnsavedChanges ? "pending" : "synced"}`}>
        {isSaving ? <FiLoader className="admin-spin" /> : hasUnsavedChanges ? <span /> : <FiCheckCircle />}
        {isSaving ? "Guardando cambios" : hasUnsavedChanges ? "Hay cambios sin publicar" : "Todo está publicado"}
      </div>

      <LocaleTabs locale={locale} onChange={onLocaleChange} />

      <section className="home-admin-card">
        <div className="home-admin-card__heading"><span>01</span><div><h3>Hero</h3><p>Texto visible sobre el video de portada.</p></div></div>
        <div className="home-admin-fields">
          <label><span>Título principal · {locale.toUpperCase()}</span><input value={settings.home.hero.title[locale] ?? ""} onChange={(event) => updateLocalized("hero.title", event.target.value)} /><small>{String(settings.home.hero.title[locale] ?? "").length} caracteres</small></label>
          <label><span>Descripción · {locale.toUpperCase()}</span><textarea rows={3} value={settings.home.hero.description[locale] ?? ""} onChange={(event) => updateLocalized("hero.description", event.target.value)} /><small>{String(settings.home.hero.description[locale] ?? "").length} caracteres</small></label>
        </div>
        <div className="home-admin-hero-preview" aria-label="Vista previa del texto del hero"><small>Vista previa</small><strong>{settings.home.hero.title[locale]}</strong><p>{settings.home.hero.description[locale]}</p></div>
      </section>

      <section className="home-admin-card">
        <div className="home-admin-card__heading"><span>02</span><div><h3>Barcos destacados</h3><p>Seleccioná exactamente cuatro y definí el orden en que aparecen.</p></div></div>
        <div className="home-admin-fields home-admin-fields--two">
          <label><span>Título · {locale.toUpperCase()}</span><input value={settings.home.featured.title[locale] ?? ""} onChange={(event) => updateLocalized("featured.title", event.target.value)} /></label>
          <label><span>Descripción · {locale.toUpperCase()}</span><input value={settings.home.featured.description[locale] ?? ""} onChange={(event) => updateLocalized("featured.description", event.target.value)} /></label>
        </div>
        <div className="home-admin-selection-heading"><strong>{selectedBoats.length} de 4 seleccionados</strong><button type="button" onClick={() => setPickerOpen(true)}><FiPlus /> Elegir barcos</button></div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBoatDrag}>
          <SortableContext items={settings.home.featured.boatIds} strategy={verticalListSortingStrategy}>
            <div className="home-admin-sortable-list">
              {selectedBoats.map((boat, index) => <SortableRow key={boat.id} id={boat.id} index={index} total={selectedBoats.length} eyebrow={collectionLabels[boat.collectionId]} title={boat.name} image={<MediaImage asset={boat.image} locale={locale} sizes="96px" />} onMove={(direction) => setBoatIds(arrayMove(settings.home.featured.boatIds, index, index + direction))} onRemove={() => toggleBoat(boat.id)} />)}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <section className="home-admin-card">
        <div className="home-admin-card__heading"><span>03</span><div><h3>Categorías</h3><p>Mantené las tres categorías y ordenalas para la home.</p></div></div>
        <div className="home-admin-fields"><label><span>Título de sección · {locale.toUpperCase()}</span><input value={settings.home.categories.title[locale] ?? ""} onChange={(event) => updateLocalized("categories.title", event.target.value)} /></label></div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCollectionDrag}>
          <SortableContext items={settings.home.categories.collectionIds} strategy={verticalListSortingStrategy}>
            <div className="home-admin-sortable-list">
              {settings.home.categories.collectionIds.map((id, index) => {
                const collection = collectionsById.get(id);
                if (!collection) return null;
                return <SortableRow key={id} id={id} index={index} total={settings.home.categories.collectionIds.length} eyebrow={`Posición ${index + 1}`} title={collectionLabels[id]} image={<MediaImage asset={collection.image} locale={locale} sizes="96px" />} onMove={(direction) => setCollectionIds(arrayMove(settings.home.categories.collectionIds, index, index + direction))} />;
              })}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {(validationErrors.length > 0 || saveStatus.tone === "error") ? (
        <div className="home-admin-validation" role="alert"><FiAlertCircle /><div><strong>{saveStatus.tone === "error" ? saveStatus.title : "Revisá antes de publicar"}</strong><ul>{(saveStatus.tone === "error" && saveStatus.details?.length ? saveStatus.details : validationErrors).map((error) => <li key={error}>{error}</li>)}</ul></div></div>
      ) : null}

      {pickerOpen ? (
        <div className="home-admin-picker-backdrop" role="presentation" onMouseDown={() => setPickerOpen(false)}>
          <section className="home-admin-picker" role="dialog" aria-modal="true" aria-labelledby="home-boat-picker-title" onMouseDown={(event) => event.stopPropagation()}>
            <header><div><span><FiGrid /> Catálogo completo</span><h3 id="home-boat-picker-title">Elegir barcos destacados</h3><p>Podés seleccionar hasta cuatro barcos visibles.</p></div><button type="button" onClick={() => setPickerOpen(false)} aria-label="Cerrar selector"><FiX /></button></header>
            <div className="home-admin-picker__filters">
              <label><FiSearch /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o ID" /></label>
              <select value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value as BoatCollectionId | "all")} aria-label="Filtrar por categoría">
                <option value="all">Todas las categorías</option>
                {Object.entries(collectionLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
            <div className="home-admin-picker__grid">
              {filteredBoats.map((boat) => {
                const selected = settings.home.featured.boatIds.includes(boat.id);
                const disabled = !selected && settings.home.featured.boatIds.length >= 4;
                return <button type="button" key={boat.id} className={selected ? "is-selected" : ""} disabled={disabled} onClick={() => toggleBoat(boat.id)}><span className="home-admin-picker__image"><MediaImage asset={boat.image} locale={locale} sizes="240px" /></span><span className="home-admin-picker__copy"><small>{collectionLabels[boat.collectionId]}</small><strong>{boat.name}</strong>{boat.priceLabel ? <span>{getLocalizedValue(boat.priceLabel, locale)}</span> : null}<em>{selected ? "Seleccionado" : "Seleccionar"}</em></span></button>;
              })}
            </div>
            <footer><span>{settings.home.featured.boatIds.length} de 4 seleccionados</span><button type="button" className="admin-button admin-button--primary" onClick={() => setPickerOpen(false)} disabled={settings.home.featured.boatIds.length !== 4}>Confirmar selección</button></footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}
