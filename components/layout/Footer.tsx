import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { NoWidowText } from "@/components/typography/NoWidowText";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getLocalizedSlug, uiLabels, type Locale } from "@/lib/i18n";
import type { ServicePage } from "@/types/content";

interface FooterProps {
  locale: Locale;
  servicePages: ServicePage[];
  phone?: string;
}

function formatPhoneDisplay(phone?: string): string {
  if (!phone) return "+34 655 835 803";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("34") && cleaned.length === 11) {
    return `+34 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.startsWith("7") && cleaned.length === 11) {
    return `+7 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  return `+${cleaned}`;
}

export function Footer({ locale, servicePages, phone }: FooterProps) {
  const labels = uiLabels[locale];
  const transfers = servicePages.find((page) => page.serviceId === "transfers");
  const waterToys = servicePages.find((page) => page.serviceId === "water-toys");
  const security = servicePages.find((page) => page.serviceId === "security");
  const selfDrive = servicePages.find((page) => page.serviceId === "self-drive");

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Link href={`/${locale}`} className="brand brand--footer" aria-label="Fast Services – Home">
            <span className="brand__logo" aria-hidden="true" />
          </Link>
          <p className="site-footer__tagline">
            <NoWidowText text={locale === "es" ? "Ibiza lifestyle management para mar, movilidad y experiencias." : "Ibiza lifestyle management for sea, mobility and experiences."} />
          </p>
        </div>
        <div>
          <h2>{labels.services}</h2>
          <Link href={`/${locale}#alquiler-barcos`}>{labels.boats}</Link>
          <Link href={`/${locale}/${transfers ? getLocalizedSlug(transfers.slugsByLocale, locale) : "transfer"}`}>{labels.transfers}</Link>
          <Link href={`/${locale}/${waterToys ? getLocalizedSlug(waterToys.slugsByLocale, locale) : "water-toys"}`}>{labels.waterToys}</Link>
          <Link href={`/${locale}/${security ? getLocalizedSlug(security.slugsByLocale, locale) : "security"}`}>{labels.security}</Link>
          <Link href={`/${locale}/${selfDrive ? getLocalizedSlug(selfDrive.slugsByLocale, locale) : "self-drive-car-rental"}`}>{labels.selfDriveVehicles}</Link>
        </div>
        <div>
          <h2>{labels.contact}</h2>
          <Link href={buildWhatsAppUrl(undefined, locale, phone)} target="_blank" rel="noreferrer"><FaWhatsapp /> {formatPhoneDisplay(phone)}</Link>
          <a href="mailto:fastservicesibiza@gmail.com">fastservicesibiza@gmail.com</a>
          <Link href="/admin" className="site-footer__admin-link">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
