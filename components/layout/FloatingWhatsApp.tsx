"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { type Locale } from "@/lib/i18n";
import { trackWhatsAppClick } from "@/lib/conversionTracking";

interface FloatingWhatsAppProps {
  locale: Locale;
  phone?: string;
}

export function FloatingWhatsApp({ locale, phone }: FloatingWhatsAppProps) {
  return (
    <Link
      href={buildWhatsAppUrl(undefined, locale, phone)}
      className="floating-whatsapp"
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      onClick={() => trackWhatsAppClick({ placement: "floating", locale })}
    >
      <FaWhatsapp aria-hidden="true" />
    </Link>
  );
}
