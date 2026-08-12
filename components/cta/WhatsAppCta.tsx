"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { uiLabels, type Locale } from "@/lib/i18n";
import { trackWhatsAppClick } from "@/lib/conversionTracking";

interface WhatsAppCtaProps {
  locale: Locale;
  message?: string;
  label?: string;
  variant?: "solid" | "outline" | "light";
  className?: string;
  phone?: string;
  placement?: string;
  boatId?: string;
  category?: string;
}

export function WhatsAppCta({ locale, message, label, variant = "solid", className = "", phone, placement = "cta", boatId, category }: WhatsAppCtaProps) {
  return (
    <Link
      href={buildWhatsAppUrl(message, locale, phone)}
      className={`whatsapp-cta whatsapp-cta--${variant} ${className}`}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackWhatsAppClick({ placement, locale, boatId, category })}
    >
      <FaWhatsapp aria-hidden="true" />
      <span>{label ?? uiLabels[locale].availability}</span>
    </Link>
  );
}
