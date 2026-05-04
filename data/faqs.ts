import type { FaqItem } from "@/types/content";

export const faqs: FaqItem[] = [
  {
    id: "availability",
    question: { es: "¿Cómo consulto disponibilidad?", en: "How do I check availability?" },
    answer: { es: "Pulsa en Consultar disponibilidad y te abriremos WhatsApp con el servicio preseleccionado.", en: "Tap Check availability and WhatsApp will open with the service preselected." }
  },
  {
    id: "water-toys-prices",
    serviceId: "water-toys",
    question: { es: "¿Por qué no se muestran precios en juguetes náuticos?", en: "Why are water toy prices not displayed?" },
    answer: { es: "La disponibilidad depende del barco, fecha, logística y condiciones. Cerramos la propuesta por WhatsApp o teléfono.", en: "Availability depends on boat, date, logistics and conditions. We close the proposal by WhatsApp or phone." }
  }
];