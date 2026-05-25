import type { ServicePage } from "@/types/content";

export const servicePages: ServicePage[] = [
  {
    id: "service-transfers",
    kind: "service",
    serviceId: "transfers",
    status: "published",
    slugsByLocale: { es: "transfer-privado", en: "private-transfers", de: "privattransfer", nl: "prive-transfers" },
    title: { es: "Servicios transfer privado", en: "Private transfer services", de: "Privattransfer", nl: "Privétransfers" },
    eyebrow: { es: "Concierge en movimiento", en: "Concierge on the move" },
    description: {
      es: "Creamos soluciones de transporte privado para cubrir cualquier necesidad en Ibiza: aeropuerto, villas, marinas, beach clubs y eventos.",
      en: "We create private transport solutions for every Ibiza need: airport, villas, marinas, beach clubs and events."
    },
    image: {
      src: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Vehículo privado premium en Ibiza", en: "Premium private vehicle in Ibiza" },
      source: "unsplash"
    },
    seoTitle: { es: "Transfer privado en Ibiza", en: "Private transfers in Ibiza" },
    seoDescription: {
      es: "Flota premium con chófer privado en Ibiza. Consulta disponibilidad por WhatsApp.",
      en: "Premium fleet with private chauffeur in Ibiza. Check availability by WhatsApp."
    },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "Service",
    whatsappMessage: {
      es: "Hola, quiero consultar disponibilidad para un transfer privado en Ibiza.",
      en: "Hello, I would like to check availability for a private transfer in Ibiza."
    }
  },
  {
    id: "service-water-toys",
    kind: "service",
    serviceId: "water-toys",
    status: "published",
    slugsByLocale: { es: "juguetes-nauticos", en: "water-toys", de: "wasserspielzeug", nl: "waterspeelgoed" },
    title: { es: "Juguetes náuticos", en: "Water toys", de: "Wasserspielzeug", nl: "Waterspeelgoed" },
    eyebrow: { es: "Diversión sobre el agua", en: "Fun on the water" },
    description: {
      es: "Complementa tu día de barco con juguetes náuticos seleccionados. Sin precios publicados: te asesoramos por WhatsApp según disponibilidad.",
      en: "Complete your boat day with selected water toys. No published prices: we advise you by WhatsApp based on availability."
    },
    image: {
      src: "https://images.unsplash.com/photo-1530870110042-98b2cb110834?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Juguetes náuticos en aguas de Ibiza", en: "Water toys on Ibiza waters" },
      source: "unsplash"
    },
    seoTitle: { es: "Juguetes náuticos en Ibiza", en: "Water toys in Ibiza" },
    seoDescription: {
      es: "Alquiler de juguetes náuticos en Ibiza bajo consulta por WhatsApp, sin precios publicados.",
      en: "Water toys in Ibiza available on WhatsApp request, with no published prices."
    },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "Service",
    whatsappMessage: {
      es: "Hola, quiero consultar disponibilidad de juguetes náuticos en Ibiza.",
      en: "Hello, I would like to check availability for water toys in Ibiza."
    }
  },
  {
    id: "service-security",
    kind: "service",
    serviceId: "security",
    status: "published",
    slugsByLocale: { es: "seguridad", en: "security", de: "sicherheit", nl: "beveiliging" },
    title: { es: "Seguridad", en: "Security", de: "Sicherheit", nl: "Beveiliging" },
    eyebrow: { es: "Protección privada", en: "Private protection", de: "Privater Schutz", nl: "Privebeveiliging" },
    description: {
      es: "Seguridad y protección para villas, escolta diurna y acompañamiento nocturno o clubbing con coordinación discreta en Ibiza.",
      en: "Security and protection for villas, daytime escort and discreet night or clubbing accompaniment in Ibiza."
    },
    image: {
      src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Villa privada con servicio de seguridad", en: "Private villa with security service" },
      source: "unsplash"
    },
    seoTitle: { es: "Seguridad privada y escoltas en Ibiza", en: "Private security and escorts in Ibiza" },
    seoDescription: {
      es: "Seguridad para villas, escolta diurna y acompañamiento nocturno o clubbing en Ibiza bajo consulta por WhatsApp.",
      en: "Villa security, daytime escort and nightlife accompaniment in Ibiza by WhatsApp request."
    },
    publishedAt: "2026-05-25",
    updatedAt: "2026-05-25",
    schemaType: "Service",
    whatsappMessage: {
      es: "Hola, quiero consultar servicios de seguridad privada y escolta en Ibiza.",
      en: "Hello, I would like to check private security and escort services in Ibiza."
    }
  },
  {
    id: "service-self-drive",
    kind: "service",
    serviceId: "self-drive",
    status: "published",
    slugsByLocale: { es: "alquiler-vehiculos-sin-conductor", en: "self-drive-car-rental", de: "mietwagen-ohne-fahrer", nl: "auto-huren-zonder-chauffeur" },
    title: { es: "Alquiler vehículos sin conductor", en: "Self-drive vehicle rental", de: "Mietwagen ohne Fahrer", nl: "Auto huren zonder chauffeur" },
    eyebrow: { es: "Autonomía en la isla", en: "Island autonomy", de: "Flexibel auf der Insel", nl: "Vrij rijden op het eiland" },
    description: {
      es: "Tres opciones de vehículos sin conductor para moverte por Ibiza a tu ritmo. Confirmamos disponibilidad, entrega y condiciones por WhatsApp.",
      en: "Three self-drive vehicle options to move around Ibiza at your own pace. We confirm availability, delivery and terms by WhatsApp."
    },
    image: {
      src: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Vehículo de alquiler sin conductor en carretera", en: "Self-drive rental vehicle on the road" },
      source: "unsplash"
    },
    seoTitle: { es: "Alquiler de vehículos sin conductor en Ibiza", en: "Self-drive car rental in Ibiza" },
    seoDescription: {
      es: "Alquiler de vehículos sin conductor en Ibiza bajo consulta por WhatsApp, sin precios publicados.",
      en: "Self-drive vehicle rental in Ibiza available on WhatsApp request, with no published prices."
    },
    publishedAt: "2026-05-25",
    updatedAt: "2026-05-25",
    schemaType: "Service",
    whatsappMessage: {
      es: "Hola, quiero consultar alquiler de vehículos sin conductor en Ibiza.",
      en: "Hello, I would like to check self-drive vehicle rental in Ibiza."
    }
  },
  {
    id: "service-contact",
    kind: "service",
    serviceId: "contact",
    status: "published",
    slugsByLocale: { es: "contacto", en: "contact", de: "kontakt", nl: "contact" },
    title: { es: "Contacto", en: "Contact", de: "Kontakt", nl: "Contact" },
    eyebrow: { es: "Servicio personalizado", en: "Personal service" },
    description: {
      es: "Cuéntanos qué necesitas y te responderemos por WhatsApp con una propuesta personalizada para Ibiza.",
      en: "Tell us what you need and we will reply by WhatsApp with a tailored Ibiza proposal."
    },
    image: {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Costa de Ibiza", en: "Ibiza coastline" },
      source: "unsplash"
    },
    seoTitle: { es: "Contacto FastServices Ibiza", en: "Contact FastServices Ibiza" },
    seoDescription: {
      es: "Contacta por WhatsApp para barcos, transfers privados y juguetes náuticos en Ibiza.",
      en: "Contact us by WhatsApp for boats, private transfers and water toys in Ibiza."
    },
    publishedAt: "2026-05-04",
    updatedAt: "2026-05-04",
    schemaType: "ContactPage",
    whatsappMessage: {
      es: "Hola, quiero recibir asesoramiento para una experiencia en Ibiza.",
      en: "Hello, I would like advice for an Ibiza experience."
    }
  }
];
