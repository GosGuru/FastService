import type { Boat, BoatCollectionId, LocalizedText, MediaAsset, SpecItem } from "@/types/content";

const boatImage = (query: string, alt: LocalizedText): MediaAsset => ({
  src: `https://images.unsplash.com/${query}?auto=format&fit=crop&w=1200&q=80`,
  alt,
  source: "unsplash"
});

const categorySlugs: Record<BoatCollectionId, LocalizedText> = {
  "yachts-xl": { es: "yates-xl", en: "xl-yachts" },
  yachts: { es: "yates", en: "yachts" },
  "fast-boats": { es: "embarcaciones-rapidas", en: "fast-boats" }
};

const specs = (cabins: string, length: string, passengers: string, bathrooms: string): SpecItem[] => [
  { icon: "cabins", label: { es: "Cabinas", en: "Cabins" }, value: { es: cabins, en: cabins } },
  { icon: "length", label: { es: "Eslora", en: "Length" }, value: { es: length, en: length } },
  { icon: "passengers", label: { es: "Pax", en: "Guests" }, value: { es: passengers, en: passengers } },
  { icon: "bathrooms", label: { es: "Baños", en: "Bathrooms" }, value: { es: bathrooms, en: bathrooms } }
];

function createBoat(input: {
  id: string;
  name: string;
  collectionId: BoatCollectionId;
  slugs: LocalizedText;
  imageQuery: string;
  cabins: string;
  length: string;
  passengers: string;
  bathrooms: string;
  priceLabel?: LocalizedText;
  budget?: { min: number; max: number };
  source?: "dropbox" | "mock";
}): Boat {
  const image = boatImage(input.imageQuery, {
    es: `${input.name} disponible para consultar en Ibiza`,
    en: `${input.name} available to enquire in Ibiza`
  });

  return {
    id: input.id,
    kind: "boat",
    name: input.name,
    collectionId: input.collectionId,
    status: "published",
    slugsByLocale: input.slugs,
    categorySlugsByLocale: categorySlugs[input.collectionId],
    image,
    gallery: [image],
    specs: specs(input.cabins, input.length, input.passengers, input.bathrooms),
    priceLabel: input.priceLabel,
    internalBudgetRange: input.budget,
    source: input.source ?? "mock",
    seoTitle: {
      es: `${input.name} en Ibiza`,
      en: `${input.name} in Ibiza`
    },
    seoDescription: {
      es: `Consulta disponibilidad de ${input.name} para una experiencia privada en Ibiza.`,
      en: `Check availability for ${input.name} for a private experience in Ibiza.`
    },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "Product",
    whatsappMessage: {
      es: `Hola, quiero consultar disponibilidad de ${input.name} en Ibiza.`,
      en: `Hello, I would like to check availability for ${input.name} in Ibiza.`
    }
  };
}

export const boats: Boat[] = [
  createBoat({ id: "pershing-90", name: "Pershing 90", collectionId: "yachts-xl", slugs: { es: "pershing-90", en: "pershing-90" }, imageQuery: "photo-1544551763-46a013bb70d5", cabins: "4", length: "28 m", passengers: "12", bathrooms: "4", priceLabel: { es: "Desde 8.000 €/día", en: "From 8,000 €/day" }, source: "dropbox" }),
  createBoat({ id: "riva-argo-90", name: "Riva Argo 90", collectionId: "yachts-xl", slugs: { es: "riva-argo-90", en: "riva-argo-90" }, imageQuery: "photo-1569263979104-865ab7cd8d13", cabins: "4", length: "28.7 m", passengers: "12", bathrooms: "5", priceLabel: { es: "Desde 12.950 €/día", en: "From 12,950 €/day" }, source: "dropbox" }),
  createBoat({ id: "mondomarine-120", name: "Mondomarine 120", collectionId: "yachts-xl", slugs: { es: "mondomarine-120", en: "mondomarine-120" }, imageQuery: "photo-1500530855697-b586d89ba3ee", cabins: "5", length: "38 m", passengers: "12", bathrooms: "6", priceLabel: { es: "Consultar precio", en: "Price on request" }, source: "dropbox" }),
  createBoat({ id: "mangusta-108", name: "Mangusta 108", collectionId: "yachts-xl", slugs: { es: "mangusta-108", en: "mangusta-108" }, imageQuery: "photo-1515238152791-8216bfdf89a7", cabins: "4", length: "33.5 m", passengers: "12", bathrooms: "5", priceLabel: { es: "Desde 11.000 €/día", en: "From 11,000 €/day" }, source: "dropbox" }),
  createBoat({ id: "leopard-102", name: "Leopard 102", collectionId: "yachts-xl", slugs: { es: "leopard-102", en: "leopard-102" }, imageQuery: "photo-1567899378494-47b22a2ae96a", cabins: "4", length: "31 m", passengers: "12", bathrooms: "5", priceLabel: { es: "Desde 10.000 €/día", en: "From 10,000 €/day" }, source: "dropbox" }),
  createBoat({ id: "astondoa-102", name: "Astondoa 102 GLX", collectionId: "yachts-xl", slugs: { es: "astondoa-102-glx", en: "astondoa-102-glx" }, imageQuery: "photo-1528154291023-a6525fabe5b4", cabins: "4", length: "31.5 m", passengers: "12", bathrooms: "6", priceLabel: { es: "Consultar precio", en: "Price on request" }, source: "dropbox" }),
  createBoat({ id: "sunseeker-95", name: "Sunseeker 95", collectionId: "yachts-xl", slugs: { es: "sunseeker-95", en: "sunseeker-95" }, imageQuery: "photo-1605281317010-fe5ffe798166", cabins: "5", length: "29 m", passengers: "12", bathrooms: "5", priceLabel: { es: "Consultar disponibilidad", en: "Check availability" }, source: "dropbox" }),
  createBoat({ id: "benetti-115", name: "Benetti 115", collectionId: "yachts-xl", slugs: { es: "benetti-115", en: "benetti-115" }, imageQuery: "photo-1507525428034-b723cf961d3e", cabins: "5", length: "35 m", passengers: "12", bathrooms: "6", priceLabel: { es: "Consultar precio", en: "Price on request" }, source: "dropbox" }),
  createBoat({ id: "cranchi-50", name: "Cranchi 50", collectionId: "yachts", slugs: { es: "cranchi-50", en: "cranchi-50" }, imageQuery: "photo-1559827260-dc66d52bef19", cabins: "3", length: "15.53 m", passengers: "11", bathrooms: "2", priceLabel: { es: "Desde 1.800 €/día", en: "From 1,800 €/day" }, budget: { min: 1800, max: 5000 } }),
  createBoat({ id: "fjord-41-xl", name: "Fjord 41 XL", collectionId: "yachts", slugs: { es: "fjord-41-xl", en: "fjord-41-xl" }, imageQuery: "photo-1505142468610-359e7d316be0", cabins: "2", length: "13.5 m", passengers: "11", bathrooms: "1", priceLabel: { es: "Desde 1.900 €/día", en: "From 1,900 €/day" }, budget: { min: 1800, max: 5000 } }),
  createBoat({ id: "sunseeker-predator-68", name: "Sunseeker Predator 68", collectionId: "yachts", slugs: { es: "sunseeker-predator-68", en: "sunseeker-predator-68" }, imageQuery: "photo-1500375592092-40eb2168fd21", cabins: "2", length: "21.6 m", passengers: "12", bathrooms: "2", priceLabel: { es: "Desde 4.150 €/día", en: "From 4,150 €/day" }, budget: { min: 1800, max: 5000 } }),
  createBoat({ id: "princess-v65", name: "Princess V65", collectionId: "yachts", slugs: { es: "princess-v65", en: "princess-v65" }, imageQuery: "photo-1471922694854-ff1b63b20054", cabins: "3", length: "20.61 m", passengers: "12", bathrooms: "3", priceLabel: { es: "Desde 3.500 €/día", en: "From 3,500 €/day" }, budget: { min: 1800, max: 5000 } }),
  createBoat({ id: "abacus-61", name: "Abacus 61", collectionId: "yachts", slugs: { es: "abacus-61", en: "abacus-61" }, imageQuery: "photo-1468581264429-2548ef9eb732", cabins: "3", length: "18.66 m", passengers: "10", bathrooms: "3", priceLabel: { es: "Desde 2.500 €/día", en: "From 2,500 €/day" }, budget: { min: 1800, max: 5000 } }),
  createBoat({ id: "princess-v58", name: "Princess V58", collectionId: "yachts", slugs: { es: "princess-v58", en: "princess-v58" }, imageQuery: "photo-1500534314209-a25ddb2bd429", cabins: "3", length: "18.2 m", passengers: "12", bathrooms: "2", priceLabel: { es: "Desde 3.100 €/día", en: "From 3,100 €/day" }, budget: { min: 1800, max: 5000 } }),
  createBoat({ id: "monte-carlo-37", name: "Monte Carlo 37", collectionId: "fast-boats", slugs: { es: "monte-carlo-37", en: "monte-carlo-37" }, imageQuery: "photo-1544551763-77ef2d0cfc6c", cabins: "2", length: "12 m", passengers: "9", bathrooms: "1", priceLabel: { es: "Desde 1.050 €/día", en: "From 1,050 €/day" }, budget: { min: 800, max: 1400 } }),
  createBoat({ id: "sessa-key-largo-36", name: "Sessa Key Largo 36", collectionId: "fast-boats", slugs: { es: "sessa-key-largo-36", en: "sessa-key-largo-36" }, imageQuery: "photo-1526761122248-c31dfd7a8f3b", cabins: "1", length: "12 m", passengers: "11", bathrooms: "1", priceLabel: { es: "Desde 1.300 €/día", en: "From 1,300 €/day" }, budget: { min: 800, max: 1400 } }),
  createBoat({ id: "pardo-38", name: "Pardo 38", collectionId: "fast-boats", slugs: { es: "pardo-38", en: "pardo-38" }, imageQuery: "photo-1528154291023-a6525fabe5b4", cabins: "2", length: "11.9 m", passengers: "12", bathrooms: "1", priceLabel: { es: "Desde 950 €/día", en: "From 950 €/day" }, budget: { min: 800, max: 1400 } }),
  createBoat({ id: "marlin-38", name: "Marlin 38", collectionId: "fast-boats", slugs: { es: "marlin-38", en: "marlin-38" }, imageQuery: "photo-1519046904884-53103b34b206", cabins: "1", length: "11.6 m", passengers: "11", bathrooms: "1", priceLabel: { es: "Desde 1.190 €/día", en: "From 1,190 €/day" }, budget: { min: 800, max: 1400 } })
];