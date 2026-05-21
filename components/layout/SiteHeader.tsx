"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { DesktopMegaMenu } from "@/components/layout/DesktopMegaMenu";
import { DesktopServicesDropdown } from "@/components/layout/DesktopServicesDropdown";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { getLocalizedSlug, uiLabels, type Locale } from "@/lib/i18n";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { servicePages } from "@/data/services";

interface SiteHeaderProps {
  locale: Locale;
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMegaMenuOpenChange = (open: boolean) => {
    setIsMegaMenuOpen(open);
    if (open) setIsServicesDropdownOpen(false);
  };

  const handleServicesDropdownOpenChange = (open: boolean) => {
    setIsServicesDropdownOpen(open);
    if (open) setIsMegaMenuOpen(false);
  };

  const labels = uiLabels[locale];
  const contactPage = servicePages.find((page) => page.serviceId === "contact");
  const contactHref = `/${locale}/${contactPage ? getLocalizedSlug(contactPage.slugsByLocale, locale) : "contact"}`;
  const headerIsActive = isScrolled || isMegaMenuOpen || isServicesDropdownOpen;

  return (
    <header className={`site-header ${headerIsActive ? "is-scrolled" : ""} ${isMegaMenuOpen || isServicesDropdownOpen ? "is-menu-open" : ""}`}>
      <div className="site-header__top">
        <div className="site-header__top-inner">
          <div className="site-header__contact-group">
            <Link href={buildWhatsAppUrl(undefined, locale)} className="site-header__contact-link" target="_blank" rel="noreferrer">
              <span className="site-header__contact-icon"><FaWhatsapp aria-hidden="true" /></span>
              <span>+34 671 338 141</span>
            </Link>
            <Link href="https://wa.me/34606592373" className="site-header__contact-link" target="_blank" rel="noreferrer">
              <span className="site-header__contact-icon"><FaWhatsapp aria-hidden="true" /></span>
              <span>+34 606 59 23 73</span>
            </Link>
          </div>
          <a href="mailto:info@ibizaboats.info" className="site-header__contact-link">
            <span className="site-header__contact-icon"><FiMail aria-hidden="true" /></span>
            <span>info@ibizaboats.info</span>
          </a>
        </div>
      </div>
      <div className="site-header__inner">
        <Link href={`/${locale}`} className="brand" aria-label="FastServices">
          <span className="brand__logo" aria-hidden="true" />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <DesktopMegaMenu locale={locale} open={isMegaMenuOpen} onOpenChange={handleMegaMenuOpenChange} />
          <DesktopServicesDropdown locale={locale} open={isServicesDropdownOpen} onOpenChange={handleServicesDropdownOpenChange} />
        </nav>
        <div className="site-header__actions">
          <LanguageSwitcher locale={locale} />
          <Link href={contactHref} className="header-contact">
            {labels.contact}
          </Link>
          <MobileMenu locale={locale} />
        </div>
      </div>
    </header>
  );
}