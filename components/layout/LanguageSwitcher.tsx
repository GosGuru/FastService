"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiGlobe } from "react-icons/fi";
import { languageNames, locales, uiLabels, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  locale: Locale;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={uiLabels[locale].language}
        onClick={() => setOpen((v) => !v)}
      >
        <FiGlobe aria-hidden="true" />
        <span>{locale.toUpperCase()}</span>
        <FiChevronDown aria-hidden="true" className={open ? "lang-dropdown__chevron--open" : ""} />
      </button>
      {open && (
        <div className="lang-dropdown__menu" role="listbox">
          {locales.map((item) => (
            <Link
              key={item}
              href={`/${item}`}
              className={item === locale ? "active" : ""}
              role="option"
              aria-selected={item === locale}
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