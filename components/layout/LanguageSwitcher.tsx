"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown, FiGlobe } from "react-icons/fi";
import { languageNames, locales, uiLabels, type Locale } from "@/lib/i18n";
import { resolveLocalizedPath, type LanguageRouteMap } from "@/lib/language-routing";

interface LanguageSwitcherProps {
  locale: Locale;
  routes?: LanguageRouteMap;
}

export function LanguageSwitcher({ locale, routes }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div className="lang-dropdown" ref={ref}>
      <button
        className="lang-dropdown__trigger"
        type="button"
        aria-expanded={open}
        aria-label={uiLabels[locale].language}
        onClick={() => setOpen((v) => !v)}
      >
        <FiGlobe aria-hidden="true" />
        <span>{locale.toUpperCase()}</span>
        <FiChevronDown aria-hidden="true" className={open ? "lang-dropdown__chevron--open" : ""} />
      </button>
      {open && (
        <div className="lang-dropdown__menu">
          {locales.map((item) => (
            <Link
              key={item}
              href={resolveLocalizedPath(pathname, locale, item, routes)}
              className={item === locale ? "active" : ""}
              aria-current={item === locale ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {languageNames[item]}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
