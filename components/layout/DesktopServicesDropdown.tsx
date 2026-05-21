"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import { getMobilePageNavigation } from "@/data/navigation";
import type { Locale } from "@/lib/i18n";
import { uiLabels } from "@/lib/i18n";

interface DesktopServicesDropdownProps {
  locale: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DesktopServicesDropdown({ locale, open, onOpenChange }: DesktopServicesDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const items = getMobilePageNavigation(locale);

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

  const servicesLabel = uiLabels[locale].services || "Servicios";

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        type="button"
        className={`nav-link nav-link--dropdown ${open ? "is-open" : ""}`}
        aria-expanded={open}
        aria-controls="services-dropdown-menu"
        onClick={() => onOpenChange(!open)}
      >
        {servicesLabel}
        <FiChevronDown aria-hidden="true" />
      </button>
      <div
        className={`services-dropdown-menu ${open ? "is-open" : ""}`}
        id="services-dropdown-menu"
      >
        <div className="services-dropdown-inner">
          {items.map((item) => (
            <Link 
              className="services-dropdown-item" 
              href={item.href} 
              key={item.label} 
              onClick={() => onOpenChange(false)}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
