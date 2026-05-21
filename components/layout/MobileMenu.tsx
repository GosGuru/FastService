"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiChevronDown, FiGlobe, FiMenu, FiX } from "react-icons/fi";
import { MediaImage } from "@/components/MediaImage";
import { getBoatNavigation, getMobilePageNavigation } from "@/data/navigation";
import { servicePages } from "@/data/services";
import { languageOptions, uiLabels, getLocalizedSlug, type Locale } from "@/lib/i18n";

interface MobileMenuProps {
  locale: Locale;
}

type MobileTab = "boats" | "pages";

const boatCardPrefixes: Record<Locale, string> = {
  es: "Alquiler de",
  en: "Rent",
  de: "Miete",
  nl: "Huur"
};

export function MobileMenu({ locale }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>("boats");
  const [languageOpen, setLanguageOpen] = useState(false);
  const labels = uiLabels[locale];
  const boatItems = getBoatNavigation(locale);
  const pageItems = getMobilePageNavigation(locale);
  const activeLanguage = languageOptions.find((item) => item.locale === locale) ?? languageOptions[0];

  const contactPage = servicePages.find((page) => page.serviceId === "contact");
  const contactHref = `/${locale}/${contactPage ? getLocalizedSlug(contactPage.slugsByLocale, locale) : "contact"}`;

  const contactNowLabel = {
    es: "Contacta ahora",
    en: "Contact now",
    de: "Jetzt kontaktieren",
    nl: "Contact opnemen"
  }[locale];

  useEffect(() => {
    if (!open) {
      document.body.classList.remove("mobile-menu-open");
      return;
    }

    const scrollY = window.scrollY;
    const previousBodyStyle = document.body.style.cssText;

    document.body.classList.add("mobile-menu-open");
    document.body.style.cssText = `${previousBodyStyle}; position: fixed; top: -${scrollY}px; left: 0; right: 0; width: 100%;`;

    return () => {
      document.body.classList.remove("mobile-menu-open");
      document.body.style.cssText = previousBodyStyle;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setLanguageOpen(false);
    setActiveTab("boats");
  }

  return (
    <>
      <button
        className={`mobile-menu-button ${open ? "is-open" : ""}`}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? labels.close : labels.menu}
      >
        {open ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
      </button>
      <div className={`mobile-panel ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-panel__bar">
          <Link href={`/${locale}`} className="brand brand--mobile" onClick={closeMenu} aria-label="FastServices">
            <span className="brand__logo" aria-hidden="true" />
          </Link>
          <div className="mobile-panel__actions">
            <div className="mobile-language">
              <button
                className="mobile-language__trigger"
                type="button"
                onClick={() => setLanguageOpen((current) => !current)}
                aria-expanded={languageOpen}
                aria-label={labels.language}
              >
                <FiGlobe aria-hidden="true" />
                <span>{activeLanguage.code}</span>
                <FiChevronDown aria-hidden="true" />
              </button>
              {languageOpen ? (
                <div className="mobile-language__menu">
                  {languageOptions.map((item) => (
                    <Link
                      key={item.locale}
                      href={`/${item.locale}`}
                      onClick={closeMenu}
                      className={item.locale === locale ? "active" : ""}
                    >
                      <span>{item.code}</span> - {item.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <button className="mobile-panel__close" type="button" onClick={closeMenu} aria-label={labels.close}>
              <FiX aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="mobile-panel__tabs" role="tablist" aria-label={labels.menu}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "boats"}
            className={activeTab === "boats" ? "active" : ""}
            onClick={() => setActiveTab("boats")}
          >
            {labels.mobileBoatsTab}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pages"}
            className={activeTab === "pages" ? "active" : ""}
            onClick={() => setActiveTab("pages")}
          >
            {labels.mobilePagesTab}
          </button>
        </div>

        <div className="mobile-panel__scroll" role="tabpanel">
          {activeTab === "boats" ? (
            <div className="mobile-panel__cards">
              {boatItems.map((item) => (
                <Link href={item.href} key={item.id} className="mobile-boat-card" onClick={closeMenu}>
                  <span className="mobile-boat-card__tag">{item.label}</span>
                  <span className="mobile-boat-card__image">
                    <MediaImage asset={item.image} locale={locale} sizes="(max-width: 430px) 100vw, 360px" />
                  </span>
                  <span className="mobile-boat-card__title">{boatCardPrefixes[locale]} {item.label}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mobile-panel__pages">
              {pageItems.map((item) => (
                <Link href={item.href} key={item.href} className="mobile-page-link" onClick={closeMenu}>
                  <span>{item.label}</span>
                  <FiArrowRight aria-hidden="true" />
                </Link>
              ))}
              <div className="mobile-menu-cta">
                <Link href={contactHref} className="mobile-menu-cta__button" onClick={closeMenu}>
                  {contactNowLabel}
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}