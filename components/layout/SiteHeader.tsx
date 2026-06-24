"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { DesktopMegaMenu } from "@/components/layout/DesktopMegaMenu";
import { DesktopServicesDropdown } from "@/components/layout/DesktopServicesDropdown";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { uiLabels, type Locale } from "@/lib/i18n";
import type { LanguageRouteMap } from "@/lib/language-routing";
import { buildWhatsAppUrl, formatPhoneDisplay } from "@/lib/whatsapp";
import { useWhatsAppPhone } from "@/lib/useWhatsAppSettings";
import type { BoatCollection, ServicePage } from "@/types/content";

interface SiteHeaderProps {
  locale: Locale;
  boatCollections: BoatCollection[];
  servicePages: ServicePage[];
  languageRoutes?: LanguageRouteMap;
}

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });

  return () => window.removeEventListener("scroll", callback);
}

function getScrollSnapshot() {
  return window.scrollY > 10;
}

function getServerScrollSnapshot() {
  return false;
}

export function SiteHeader({ locale, boatCollections, servicePages, languageRoutes }: SiteHeaderProps) {
  const isScrolled = useSyncExternalStore(subscribeToScroll, getScrollSnapshot, getServerScrollSnapshot);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const phone = useWhatsAppPhone(locale);

  const handleMegaMenuOpenChange = (open: boolean) => {
    setIsMegaMenuOpen(open);
    if (open) setIsServicesDropdownOpen(false);
  };

  const handleServicesDropdownOpenChange = (open: boolean) => {
    setIsServicesDropdownOpen(open);
    if (open) setIsMegaMenuOpen(false);
  };

  const labels = uiLabels[locale];
  const contactHref = buildWhatsAppUrl(undefined, locale, phone);
  const headerIsActive = isScrolled || isMegaMenuOpen || isServicesDropdownOpen;

  return (
    <header className={`site-header ${headerIsActive ? "is-scrolled" : ""} ${isMegaMenuOpen || isServicesDropdownOpen ? "is-menu-open" : ""}`}>
      <div className="site-header__top">
        <div className="site-header__top-inner">
          <div className="site-header__contact-group">
            <Link href={buildWhatsAppUrl(undefined, locale, phone)} className="site-header__contact-link" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <span className="site-header__contact-icon site-header__contact-icon--whatsapp"><FaWhatsapp aria-hidden="true" /></span>
              <span>{formatPhoneDisplay(phone)}</span>
            </Link>
            <Link href="https://www.instagram.com/fastservicesibiza/?hl=en" className="site-header__contact-link" target="_blank" rel="noreferrer" aria-label="Instagram">
              <span className="site-header__contact-icon site-header__contact-icon--instagram"><FaInstagram aria-hidden="true" /></span>
              <span>@fastservicesibiza</span>
            </Link>
          </div>
          <a href="mailto:fastservicesibiza@gmail.com" className="site-header__contact-link">
            <span className="site-header__contact-icon site-header__contact-icon--gmail"><FiMail aria-hidden="true" /></span>
            <span>fastservicesibiza@gmail.com</span>
          </a>
        </div>
      </div>
      <div className="site-header__inner">
        <Link href={`/${locale}`} className="brand" aria-label={labels.ariaHome}>
          <span className="brand__logo" aria-hidden="true" />
        </Link>
        <nav className="desktop-nav" aria-label={labels.ariaPrimaryNavigation}>
          <DesktopMegaMenu locale={locale} open={isMegaMenuOpen} onOpenChange={handleMegaMenuOpenChange} boatCollections={boatCollections} />
          <DesktopServicesDropdown locale={locale} open={isServicesDropdownOpen} onOpenChange={handleServicesDropdownOpenChange} servicePages={servicePages} />
        </nav>
        <div className="site-header__actions">
          <LanguageSwitcher locale={locale} routes={languageRoutes} />
          <Link href={contactHref} className="header-contact" target="_blank" rel="noreferrer">
            {labels.contact}
          </Link>
          <MobileMenu locale={locale} boatCollections={boatCollections} servicePages={servicePages} languageRoutes={languageRoutes} />
        </div>
      </div>
    </header>
  );
}
