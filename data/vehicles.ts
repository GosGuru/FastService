import type { SpecItem, Vehicle } from "@/types/content";

const vehicleSpecs = (passengers: string, bags: string): SpecItem[] => [
  { icon: "passengers", label: { es: "Pasajeros", en: "Passengers" }, value: { es: passengers, en: passengers } },
  { icon: "bags", label: { es: "Equipaje", en: "Luggage" }, value: { es: bags, en: bags } },
  { icon: "comfort", label: { es: "Confort", en: "Comfort" }, value: { es: "Piel, A/C", en: "Leather, A/C" } },
  { icon: "water", label: { es: "A bordo", en: "On board" }, value: { es: "Agua y cargadores", en: "Water and chargers" } }
];

export const vehicles: Vehicle[] = [
  {
    id: "mercedes-v-class",
    kind: "vehicle",
    name: "Mercedes-Benz V Class",
    status: "published",
    slugsByLocale: { es: "mercedes-v-class", en: "mercedes-v-class" },
    image: {
      src: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Mercedes-Benz V Class para transfer privado", en: "Mercedes-Benz V Class for private transfer" },
      source: "unsplash"
    },
    gallery: [],
    specs: vehicleSpecs("7 + chófer", "5 bolsas"),
    overview: {
      es: "La opción más versátil para familias y grupos que quieren moverse por Ibiza con comodidad, discreción y puntualidad.",
      en: "The most versatile option for families and groups who want to move around Ibiza with comfort, discretion and punctuality."
    },
    services: [
      { es: "Servicio punto a punto", en: "Point to point service" },
      { es: "Chófer dedicado", en: "Dedicated chauffeur" },
      { es: "Aeropuerto, jets privados y marinas", en: "Airport, private jets and marinas" },
      { es: "Beach clubs, villas, hoteles y restaurantes", en: "Beach clubs, villas, hotels and restaurants" }
    ],
    seoTitle: { es: "Mercedes V Class con chófer en Ibiza", en: "Mercedes V Class with chauffeur in Ibiza" },
    seoDescription: {
      es: "Consulta disponibilidad para Mercedes-Benz V Class con chófer privado en Ibiza.",
      en: "Check availability for Mercedes-Benz V Class with private chauffeur in Ibiza."
    },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "Product",
    whatsappMessage: {
      es: "Hola, quiero consultar disponibilidad de Mercedes-Benz V Class con chófer en Ibiza.",
      en: "Hello, I would like to check availability for Mercedes-Benz V Class with chauffeur in Ibiza."
    }
  },
  {
    id: "mercedes-sprinter-12",
    kind: "vehicle",
    name: "Mercedes Sprinter 12 plazas",
    status: "published",
    slugsByLocale: { es: "mercedes-sprinter-12-plazas", en: "mercedes-sprinter-12-seats" },
    image: {
      src: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Mercedes Sprinter para grupos", en: "Mercedes Sprinter for groups" },
      source: "unsplash"
    },
    gallery: [],
    specs: vehicleSpecs("12 + chófer", "10 bolsas"),
    overview: {
      es: "Perfecta para grupos, eventos y traslados coordinados entre villas, puerto, aeropuerto y clubs.",
      en: "Perfect for groups, events and coordinated transfers between villas, port, airport and clubs."
    },
    services: [
      { es: "Eventos privados", en: "Private events" },
      { es: "Rutas nocturnas", en: "Night routes" },
      { es: "Coordinación multi-parada", en: "Multi-stop coordination" }
    ],
    seoTitle: { es: "Mercedes Sprinter privada en Ibiza", en: "Private Mercedes Sprinter in Ibiza" },
    seoDescription: {
      es: "Mercedes Sprinter para grupos con chófer privado en Ibiza.",
      en: "Mercedes Sprinter for groups with private chauffeur in Ibiza."
    },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "Product",
    whatsappMessage: {
      es: "Hola, quiero consultar disponibilidad de Mercedes Sprinter para un grupo en Ibiza.",
      en: "Hello, I would like to check Mercedes Sprinter availability for a group in Ibiza."
    }
  },
  {
    id: "mercedes-vito",
    kind: "vehicle",
    name: "Mercedes-Benz Vito",
    status: "published",
    slugsByLocale: { es: "mercedes-benz-vito", en: "mercedes-benz-vito" },
    image: {
      src: "https://images.unsplash.com/photo-1583267746897-2cf415887172?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Mercedes-Benz Vito para transfer", en: "Mercedes-Benz Vito for transfer" },
      source: "unsplash"
    },
    gallery: [],
    specs: vehicleSpecs("8 + chófer", "6 bolsas"),
    overview: {
      es: "Una solución cómoda y discreta para transfers ágiles con grupo reducido o familia.",
      en: "A comfortable and discreet solution for agile transfers with a small group or family."
    },
    services: [
      { es: "Airport transfer", en: "Airport transfer" },
      { es: "Puerto y marinas", en: "Port and marinas" },
      { es: "Restaurantes y beach clubs", en: "Restaurants and beach clubs" }
    ],
    seoTitle: { es: "Mercedes Vito con chófer en Ibiza", en: "Mercedes Vito with chauffeur in Ibiza" },
    seoDescription: {
      es: "Consulta Mercedes Vito con chófer para moverte por Ibiza.",
      en: "Enquire about Mercedes Vito with chauffeur for Ibiza transfers."
    },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "Product",
    whatsappMessage: {
      es: "Hola, quiero consultar disponibilidad de Mercedes-Benz Vito en Ibiza.",
      en: "Hello, I would like to check Mercedes-Benz Vito availability in Ibiza."
    }
  }
];