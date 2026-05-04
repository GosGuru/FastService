import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { type Locale } from "@/lib/i18n";

interface FloatingWhatsAppProps {
  locale: Locale;
}

export function FloatingWhatsApp({ locale }: FloatingWhatsAppProps) {
  return (
    <Link
      href={buildWhatsAppUrl(undefined, locale)}
      className="floating-whatsapp"
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
    >
      <FaWhatsapp aria-hidden="true" />
    </Link>
  );
}
