import Link from "next/link";
import { FiArrowRight, FiCompass, FiHome, FiMessageCircle } from "react-icons/fi";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { isLocale, type Locale } from "@/lib/i18n";

interface PremiumNotFoundContentProps {
  locale?: Locale | string;
  title?: string;
  description?: string;
  eyebrow?: string;
  note?: string;
  question?: string;
}

const copy = {
  es: {
    eyebrow: "No encontramos esto",
    title: "Ups, parece que lo que buscabas no está disponible.",
    description: "Puede que el enlace haya cambiado o que esa ficha ya no esté publicada. Puedes seguir navegando desde acá.",
    question: "¿Qué quieres hacer ahora?",
    home: "Ir al inicio",
    boats: "Ver barcos disponibles",
    whatsapp: "Escribir por WhatsApp",
    note: "Si buscabas una reserva concreta, te ayudamos por WhatsApp."
  },
  en: {
    eyebrow: "We could not find this",
    title: "Looks like what you were looking for is not available.",
    description: "The link may have changed or the listing may no longer be published. You can keep browsing from here.",
    question: "What would you like to do now?",
    home: "Go home",
    boats: "View available boats",
    whatsapp: "Message us on WhatsApp",
    note: "If you were looking for a specific booking, we can help on WhatsApp."
  }
};

function getLocale(value: PremiumNotFoundContentProps["locale"]): Locale {
  return typeof value === "string" && isLocale(value) ? value : "es";
}

export function PremiumNotFoundContent({ locale: rawLocale, title, description, eyebrow, note, question }: PremiumNotFoundContentProps) {
  const locale = getLocale(rawLocale);
  const content = locale === "es" ? copy.es : copy.en;

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
          <div className="route-feedback__actions" aria-label="Opciones para continuar">
            <Link href={`/${locale}`} className="route-feedback__button route-feedback__button--primary">
              <FiHome aria-hidden="true" />
              {content.home}
            </Link>
            <Link href={`/${locale}#barcos-destacados`} className="route-feedback__button">
              {content.boats}
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link href={buildWhatsAppUrl(undefined, locale)} className="route-feedback__button route-feedback__button--ghost" target="_blank" rel="noreferrer">
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
