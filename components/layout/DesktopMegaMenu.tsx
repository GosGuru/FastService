"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import { MediaImage } from "@/components/MediaImage";
import { getBoatNavigation } from "@/data/navigation";
import type { Locale } from "@/lib/i18n";

interface DesktopMegaMenuProps {
  locale: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DesktopMegaMenu({ locale, open, onOpenChange }: DesktopMegaMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const items = getBoatNavigation(locale);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        type="button"
        className={`nav-link nav-link--dropdown ${open ? "is-open" : ""}`}
        aria-expanded={open}
        aria-controls="boat-mega-menu"
        onClick={() => onOpenChange(!open)}
      >
        {locale === "es" ? "Alquiler de barcos" : "Boat rentals"}
        <FiChevronDown aria-hidden="true" />
      </button>
      <div
        className={`mega-menu ${open ? "is-open" : ""}`}
        id="boat-mega-menu"
        aria-label={locale === "es" ? "Colecciones de barcos" : "Boat collections"}
      >
        <div className="mega-menu__grid">
          {items.map((item) => (
            <Link className="mega-card" href={item.href} key={item.id} onClick={() => onOpenChange(false)}>
              <span className="mega-card__tag">{item.label}</span>
              <span className="mega-card__image">
                <MediaImage asset={item.image} locale={locale} sizes="25vw" />
              </span>
              <span className="mega-card__title">
                {locale === "es" ? `Alquiler de ${item.label} en Ibiza` : `Rent ${item.label} in Ibiza`}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}