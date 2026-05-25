"use client";

import { useState } from "react";
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
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  if (!items.length) return null;

  const copy = faqCopy[locale];
  const toggleItem = (id: string) => {
    setOpenItems((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  return (
    <section className="faq-section" aria-labelledby="faq-section-title">
      <div className="container faq-section__inner">
        <div className="faq-section__headline">
          <h2 id="faq-section-title">{title ?? copy.title}</h2>
          <p>{intro ?? copy.intro}</p>
        </div>

        <div className="faq-section__items">
          {items.map((item, index) => {
            const answerId = `faq-answer-${item.id}`;
            const isOpen = openItems.has(item.id);

            return (
              <article className={`faq-section__item${isOpen ? " is-open" : ""}`} key={item.id}>
                <button
                  type="button"
                  className="faq-section__trigger"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleItem(item.id)}
                >
                  <span>{index + 1}. {getLocalizedValue(item.question, locale)}</span>
                  <span className="faq-section__icon" aria-hidden="true" />
                </button>
                <div className="faq-section__panel" id={answerId} aria-hidden={!isOpen}>
                  <div className="faq-section__answer">
                    <p>{getLocalizedValue(item.answer, locale)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
