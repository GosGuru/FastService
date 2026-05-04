import type { BoatCollection } from "@/types/content";

export const boatCollections: BoatCollection[] = [
  {
    id: "collection-yachts-xl",
    kind: "boatCollection",
    collectionId: "yachts-xl",
    status: "hidden",
    slugsByLocale: { es: "yates-xl", en: "xl-yachts", de: "xl-yachten", nl: "xl-jachten" },
    title: { es: "Yates XL", en: "XL Yachts", de: "XL-Yachten", nl: "XL-jachten" },
    eyebrow: { es: "Alquiler de barcos", en: "Boat rentals", de: "Yachten mieten", nl: "Jachten huren" },
    description: {
      es: "Una selección de ocho grandes yates para experiencias premium en Ibiza y Formentera.",
      en: "A selection of eight large yachts for premium experiences around Ibiza and Formentera."
    },
    image: {
      src: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Megayate navegando en Ibiza", en: "Large yacht cruising in Ibiza" },
      source: "unsplash"
    },
    countTarget: 8,
    hiddenPage: true,
    selectionNote: {
      es: "Seleccionar 8 embarcaciones desde Dropbox.",
      en: "Select 8 boats from Dropbox."
    },
    seoTitle: { es: "Yates XL en Ibiza", en: "XL yachts in Ibiza" },
    seoDescription: {
      es: "Colección privada de yates XL para consultar disponibilidad por WhatsApp.",
      en: "Private XL yacht collection with availability by WhatsApp."
    },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "CollectionPage",
    whatsappMessage: {
      es: "Hola, quiero consultar disponibilidad de Yates XL en Ibiza.",
      en: "Hello, I would like to check availability for XL yachts in Ibiza."
    }
  },
  {
    id: "collection-yachts",
    kind: "boatCollection",
    collectionId: "yachts",
    status: "hidden",
    slugsByLocale: { es: "yates", en: "yachts", de: "yachten", nl: "jachten" },
    title: { es: "Yates", en: "Yachts", de: "Yachten", nl: "Jachten" },
    eyebrow: { es: "Alquiler de barcos", en: "Boat rentals", de: "Yachten mieten", nl: "Jachten huren" },
    description: {
      es: "Seis yates seleccionados para day charter y experiencias privadas con presupuesto entre 1.800 y 5.000 euros.",
      en: "Six selected yachts for day charters and private experiences with a 1,800 to 5,000 euro budget range."
    },
    image: {
      src: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Yate blanco en aguas turquesas", en: "White yacht on turquoise water" },
      source: "unsplash"
    },
    countTarget: 6,
    hiddenPage: true,
    selectionNote: {
      es: "Seleccionar 6 barcos entre 1.800 y 5.000 euros.",
      en: "Select 6 boats between 1,800 and 5,000 euros."
    },
    seoTitle: { es: "Yates en alquiler en Ibiza", en: "Yacht rental in Ibiza" },
    seoDescription: {
      es: "Selección de yates en Ibiza con consulta directa por WhatsApp.",
      en: "Selected yachts in Ibiza with direct availability checks by WhatsApp."
    },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "CollectionPage",
    whatsappMessage: {
      es: "Hola, quiero consultar disponibilidad de yates en Ibiza.",
      en: "Hello, I would like to check yacht availability in Ibiza."
    }
  },
  {
    id: "collection-fast-boats",
    kind: "boatCollection",
    collectionId: "fast-boats",
    status: "hidden",
    slugsByLocale: { es: "embarcaciones-rapidas", en: "fast-boats", de: "schnellboote", nl: "snelle-boten" },
    title: { es: "Embarcaciones rápidas", en: "Fast boats", de: "Schnellboote", nl: "Snelle boten" },
    eyebrow: { es: "Alquiler de barcos", en: "Boat rentals", de: "Yachten mieten", nl: "Jachten huren" },
    description: {
      es: "Cuatro embarcaciones rápidas para day trips, calas y travesías ágiles entre Ibiza y Formentera.",
      en: "Four fast boats for day trips, coves and agile routes between Ibiza and Formentera."
    },
    image: {
      src: "https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Lancha rápida sobre agua azul", en: "Fast boat on blue water" },
      source: "unsplash"
    },
    countTarget: 4,
    hiddenPage: true,
    selectionNote: {
      es: "Seleccionar 4 barcos entre 800 y 1.400 euros.",
      en: "Select 4 boats between 800 and 1,400 euros."
    },
    seoTitle: { es: "Embarcaciones rápidas en Ibiza", en: "Fast boats in Ibiza" },
    seoDescription: {
      es: "Embarcaciones rápidas en Ibiza con disponibilidad bajo consulta por WhatsApp.",
      en: "Fast boats in Ibiza with availability on request by WhatsApp."
    },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "CollectionPage",
    whatsappMessage: {
      es: "Hola, quiero consultar disponibilidad de embarcaciones rápidas en Ibiza.",
      en: "Hello, I would like to check fast boat availability in Ibiza."
    }
  }
];