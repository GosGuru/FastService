import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Locale } from "@/lib/i18n";

const cardActionLabels: Record<Locale, { availability: string; viewModel: string }> = {
  es: { availability: "Consultar disponibilidad", viewModel: "Ver modelo" },
  en: { availability: "Availability", viewModel: "View model" },
  de: { availability: "Verfügbarkeit", viewModel: "Modell ansehen" },
  nl: { availability: "Beschikbaarheid", viewModel: "Model bekijken" }
};

interface CardActionsProps {
  locale: Locale;
  whatsappMessage: string;
  detailHref: string;
  showDetail?: boolean;
}

export function CardActions({ locale, whatsappMessage, detailHref, showDetail = true }: CardActionsProps) {
  const labels = cardActionLabels[locale];
  const whatsappHref = buildWhatsAppUrl(whatsappMessage, locale);

  return (
    <div className={`catalog-card-actions ${!showDetail ? "catalog-card-actions--single" : ""}`}>
      <Link href={whatsappHref} className="catalog-card-actions__btn catalog-card-actions__btn--wa" target="_blank" rel="noreferrer">
        <FaWhatsapp aria-hidden="true" />
        <span>{labels.availability}</span>
      </Link>
      {showDetail && (
        <Link href={detailHref} className="catalog-card-actions__btn catalog-card-actions__btn--detail">
          <span>{labels.viewModel}</span>
          <FiArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
