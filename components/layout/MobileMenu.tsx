"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiChevronDown, FiGlobe, FiMenu, FiX } from "react-icons/fi";
import { MediaImage } from "@/components/MediaImage";
import { getBoatNavigation, getPrimaryNavigation } from "@/data/navigation";
import { languageOptions, uiLabels, type Locale } from "@/lib/i18n";

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
  const pageItems = getPrimaryNavigation(locale).filter((item) => !item.hasMegaMenu);
  const activeLanguage = languageOptions.find((item) => item.locale === locale) ?? languageOptions[0];

  useEffect(() => {
    if (!open) {
      document.body.classList.remove("mobile-menu-open");
      return;
    }

    const scrollY = window.scrollY;
    const previousStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow
    };

    document.body.classList.add("mobile-menu-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.classList.remove("mobile-menu-open");
      document.body.style.position = previousStyles.position;
      document.body.style.top = previousStyles.top;
      document.body.style.left = previousStyles.left;
      document.body.style.right = previousStyles.right;
      document.body.style.width = previousStyles.width;
      document.body.style.overflow = previousStyles.overflow;
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
      <button className="mobile-menu-button" type="button" onClick={() => setOpen((v) => !v)} aria-label={open ? labels.close : labels.menu}>
        {open ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
      </button>
      <div className={`mobile-panel ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-panel__bar">
          <Link href={`/${locale}`} className="brand brand--mobile" onClick={closeMenu}>
            <span>FAST</span>Services
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

        {activeTab === "boats" ? (
          <div className="mobile-panel__cards" role="tabpanel">
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
          <div className="mobile-panel__pages" role="tabpanel">
            {pageItems.map((item) => (
              <Link href={item.href} key={item.href} className="mobile-page-link" onClick={closeMenu}>
                <span>{item.label}</span>
                <FiArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}

      </div>
    </>
  );
}