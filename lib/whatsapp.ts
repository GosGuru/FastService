import type { Locale } from "@/lib/i18n";

const whatsappPhone = "34671338141";

const defaults: Record<Locale, string> = {
  es: "Hola, quiero consultar disponibilidad para un servicio en Ibiza.",
  en: "Hello, I would like to check availability for a service in Ibiza.",
  de: "Hallo, ich möchte die Verfügbarkeit für einen Service auf Ibiza prüfen.",
  nl: "Hallo, ik wil graag de beschikbaarheid voor een service op Ibiza controleren."
};

export function buildWhatsAppUrl(message?: string, locale: Locale = "es") {
  const text = encodeURIComponent(message ?? defaults[locale]);
  return `https://wa.me/${whatsappPhone}?text=${text}`;
}