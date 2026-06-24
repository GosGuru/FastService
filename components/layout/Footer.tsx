import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { NoWidowText } from "@/components/typography/NoWidowText";
import { buildWhatsAppUrl, formatPhoneDisplay } from "@/lib/whatsapp";
import { getLocalizedSlug, uiLabels, type Locale } from "@/lib/i18n";
import type { ServicePage } from "@/types/content";

interface FooterProps {
  locale: Locale;
  servicePages: ServicePage[];
  phone?: string;
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
          <Link href={`/${locale}`} className="brand brand--footer" aria-label={labels.ariaHome}>
            <span className="brand__logo" aria-hidden="true" />
          </Link>
          <p className="site-footer__tagline">
            <NoWidowText text={labels.footerTagline} />
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
        </div>
      </div>
    </footer>
  );
}
