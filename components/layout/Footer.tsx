import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getLocalizedSlug, uiLabels, type Locale } from "@/lib/i18n";
import { servicePages } from "@/data/services";

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const labels = uiLabels[locale];
  const transfers = servicePages.find((page) => page.serviceId === "transfers");
  const waterToys = servicePages.find((page) => page.serviceId === "water-toys");

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Link href={`/${locale}`} className="brand brand--footer" aria-label="Fast Services – Home">
            <span className="brand__logo" aria-hidden="true" />
          </Link>
          <p className="site-footer__tagline">{locale === "es" ? "Ibiza lifestyle management para mar, movilidad y experiencias." : "Ibiza lifestyle management for sea, mobility and experiences."}</p>
        </div>
        <div>
          <h2>{labels.services}</h2>
          <Link href={`/${locale}#alquiler-barcos`}>{labels.boats}</Link>
          <Link href={`/${locale}/${transfers ? getLocalizedSlug(transfers.slugsByLocale, locale) : "transfer"}`}>{labels.transfers}</Link>
          <Link href={`/${locale}/${waterToys ? getLocalizedSlug(waterToys.slugsByLocale, locale) : "water-toys"}`}>{labels.waterToys}</Link>
        </div>
        <div>
          <h2>{labels.contact}</h2>
          <Link href={buildWhatsAppUrl(undefined, locale)} target="_blank" rel="noreferrer"><FaWhatsapp /> +34 671 338 141</Link>
          <a href="mailto:info@fastservices.example">info@fastservices.example</a>
          <Link href="/admin" className="site-footer__admin-link">Admin</Link>
        </div>
      </div>
    </footer>
  );
}