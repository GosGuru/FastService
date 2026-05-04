import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { uiLabels, type Locale } from "@/lib/i18n";

interface WhatsAppCtaProps {
  locale: Locale;
  message?: string;
  label?: string;
  variant?: "solid" | "outline" | "light";
  className?: string;
}

export function WhatsAppCta({ locale, message, label, variant = "solid", className = "" }: WhatsAppCtaProps) {
  return (
    <Link
      href={buildWhatsAppUrl(message, locale)}
      className={`whatsapp-cta whatsapp-cta--${variant} ${className}`}
      target="_blank"
      rel="noreferrer"
    >
      <FaWhatsapp aria-hidden="true" />
      <span>{label ?? uiLabels[locale].availability}</span>
    </Link>
  );
}