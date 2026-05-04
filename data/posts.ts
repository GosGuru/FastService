import type { BlogPost } from "@/types/content";

export const posts: BlogPost[] = [
  {
    id: "ibiza-sea-day",
    kind: "post",
    status: "published",
    slugsByLocale: { es: "como-organizar-un-dia-perfecto-en-ibiza", en: "how-to-plan-a-perfect-ibiza-day" },
    title: { es: "Cómo organizar un día perfecto en Ibiza", en: "How to plan a perfect Ibiza day" },
    excerpt: { es: "Barco, transfer y juguetes náuticos coordinados desde una sola conversación.", en: "Boat, transfer and water toys coordinated from one conversation." },
    body: [
      { es: "La clave está en unir transporte, mar y extras sin hacer que el cliente coordine cinco proveedores.", en: "The key is bringing transport, sea and extras together without making the client coordinate five providers." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Día en Ibiza junto al mar", en: "A day by the sea in Ibiza" },
      source: "unsplash"
    },
    category: { es: "Ibiza lifestyle", en: "Ibiza lifestyle" },
    seoTitle: { es: "Organizar un día perfecto en Ibiza", en: "Plan a perfect Ibiza day" },
    seoDescription: { es: "Ideas para coordinar barco, transfer y extras en Ibiza.", en: "Ideas to coordinate a boat, transfer and extras in Ibiza." },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "BlogPosting"
  }
];