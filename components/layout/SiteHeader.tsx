"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { DesktopMegaMenu } from "@/components/layout/DesktopMegaMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { getPrimaryNavigation } from "@/data/navigation";
import { getLocalizedSlug, uiLabels, type Locale } from "@/lib/i18n";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { servicePages } from "@/data/services";

interface SiteHeaderProps {
  locale: Locale;
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const labels = uiLabels[locale];
  const contactPage = servicePages.find((page) => page.serviceId === "contact");
  const contactHref = `/${locale}/${contactPage ? getLocalizedSlug(contactPage.slugsByLocale, locale) : "contact"}`;
  const headerIsActive = isScrolled || isMegaMenuOpen;
  const nav = getPrimaryNavigation(locale).reduce<ReturnType<typeof getPrimaryNavigation>>((items, item) => {
    if (!item.hasMegaMenu && !item.cta) {
      items.push(item);
    }

    return items;
  }, []);

  return (
    <header className={`site-header ${headerIsActive ? "is-scrolled" : ""} ${isMegaMenuOpen ? "is-menu-open" : ""}`}>
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
          <DesktopMegaMenu locale={locale} open={isMegaMenuOpen} onOpenChange={setIsMegaMenuOpen} />
          {nav.map((item) => (
            <Link href={item.href} className="nav-link" key={item.href}>
              {item.label}
            </Link>
          ))}
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