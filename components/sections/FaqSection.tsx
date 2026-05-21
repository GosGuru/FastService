import { getLocalizedValue, type Locale } from "@/lib/i18n";
import type { FaqItem } from "@/types/content";

const faqCopy: Record<Locale, { title: string; intro: string }> = {
  es: {
    title: "FAQ - FastServices Ibiza",
    intro: "Respuestas rápidas sobre alquiler de barcos, reservas, rutas, pagos y qué esperar durante tu día en el mar."
  },
  en: {
    title: "FAQ - FastServices Ibiza",
    intro: "Quick answers about boat rental, bookings, routes, payments and what to expect during your day at sea."
  },
  de: {
    title: "FAQ - FastServices Ibiza",
    intro: "Schnelle Antworten zu Bootsvermietung, Buchung, Routen, Zahlungen und deinem Tag auf dem Meer."
  },
  nl: {
    title: "FAQ - FastServices Ibiza",
    intro: "Snelle antwoorden over bootverhuur, boekingen, routes, betalingen en wat je kunt verwachten op zee."
  }
};

interface FaqSectionProps {
  items: FaqItem[];
  locale: Locale;
  title?: string;
  intro?: string;
}

export function FaqSection({ items, locale, title, intro }: FaqSectionProps) {
  if (!items.length) return null;

  const copy = faqCopy[locale];

  return (
    <section className="faq-section" aria-labelledby="faq-section-title">
      <div className="container faq-section__inner">
        <div className="faq-section__headline">
          <h2 id="faq-section-title">{title ?? copy.title}</h2>
          <p>{intro ?? copy.intro}</p>
        </div>

        <div className="faq-section__items">
          {items.map((item, index) => (
            <details className="faq-section__item" key={item.id}>
              <summary>
                <span>{index + 1}. {getLocalizedValue(item.question, locale)}</span>
              </summary>
              <div className="faq-section__answer">
                <p>{getLocalizedValue(item.answer, locale)}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}