import Link from "next/link";
import { FiArrowRight, FiCompass, FiHome, FiMessageCircle } from "react-icons/fi";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { isLocale, uiLabels, type Locale } from "@/lib/i18n";

interface PremiumNotFoundContentProps {
  locale?: Locale | string;
  title?: string;
  description?: string;
  eyebrow?: string;
  note?: string;
  question?: string;
  phone?: string;
}

type NotFoundCopy = {
  eyebrow: string;
  title: string;
  description: string;
  question: string;
  home: string;
  boats: string;
  whatsapp: string;
  note: string;
};

const copy: Record<Locale, NotFoundCopy> = {
  es: {
    eyebrow: uiLabels.es.errorEyebrow,
    title: uiLabels.es.errorTitle,
    description: uiLabels.es.errorDescription,
    question: uiLabels.es.errorQuestion,
    home: uiLabels.es.errorHome,
    boats: uiLabels.es.errorBoats,
    whatsapp: uiLabels.es.errorWhatsApp,
    note: uiLabels.es.errorNote
  },
  en: {
    eyebrow: uiLabels.en.errorEyebrow,
    title: uiLabels.en.errorTitle,
    description: uiLabels.en.errorDescription,
    question: uiLabels.en.errorQuestion,
    home: uiLabels.en.errorHome,
    boats: uiLabels.en.errorBoats,
    whatsapp: uiLabels.en.errorWhatsApp,
    note: uiLabels.en.errorNote
  },
  de: {
    eyebrow: uiLabels.de.errorEyebrow,
    title: uiLabels.de.errorTitle,
    description: uiLabels.de.errorDescription,
    question: uiLabels.de.errorQuestion,
    home: uiLabels.de.errorHome,
    boats: uiLabels.de.errorBoats,
    whatsapp: uiLabels.de.errorWhatsApp,
    note: uiLabels.de.errorNote
  },
  nl: {
    eyebrow: uiLabels.nl.errorEyebrow,
    title: uiLabels.nl.errorTitle,
    description: uiLabels.nl.errorDescription,
    question: uiLabels.nl.errorQuestion,
    home: uiLabels.nl.errorHome,
    boats: uiLabels.nl.errorBoats,
    whatsapp: uiLabels.nl.errorWhatsApp,
    note: uiLabels.nl.errorNote
  },
  ru: {
    eyebrow: uiLabels.ru.errorEyebrow,
    title: uiLabels.ru.errorTitle,
    description: uiLabels.ru.errorDescription,
    question: uiLabels.ru.errorQuestion,
    home: uiLabels.ru.errorHome,
    boats: uiLabels.ru.errorBoats,
    whatsapp: uiLabels.ru.errorWhatsApp,
    note: uiLabels.ru.errorNote
  }
};

function getLocale(value: PremiumNotFoundContentProps["locale"]): Locale {
  return typeof value === "string" && isLocale(value) ? value : "es";
}

export function PremiumNotFoundContent({ locale: rawLocale, title, description, eyebrow, note, question, phone }: PremiumNotFoundContentProps) {
  const locale = getLocale(rawLocale);
  const content = copy[locale];

  return (
    <main className="route-feedback route-feedback--not-found">
      <section className="route-feedback__panel" aria-labelledby="route-feedback-title">
        <div className="route-feedback__visual" aria-hidden="true">
          <span className="route-feedback__orb route-feedback__orb--one" />
          <span className="route-feedback__orb route-feedback__orb--two" />
          <FiCompass />
        </div>
        <div className="route-feedback__content">
          <p className="eyebrow">{eyebrow ?? content.eyebrow}</p>
          <h1 id="route-feedback-title">{title ?? content.title}</h1>
          <p>{description ?? content.description}</p>
          <p className="route-feedback__question">{question ?? content.question}</p>
          <div className="route-feedback__actions" aria-label={uiLabels[locale].errorActionsAriaLabel}>
            <Link href={`/${locale}`} className="route-feedback__button route-feedback__button--primary">
              <FiHome aria-hidden="true" />
              {content.home}
            </Link>
            <Link href={`/${locale}#barcos-destacados`} className="route-feedback__button">
              {content.boats}
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link href={buildWhatsAppUrl(undefined, locale, phone)} className="route-feedback__button route-feedback__button--ghost" target="_blank" rel="noreferrer">
              <FiMessageCircle aria-hidden="true" />
              {content.whatsapp}
            </Link>
          </div>
          <p className="route-feedback__note">{note ?? content.note}</p>
        </div>
      </section>
    </main>
  );
}
