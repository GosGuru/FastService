"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import { getMobilePageNavigation } from "@/data/navigation";
import type { Locale } from "@/lib/i18n";
import { uiLabels } from "@/lib/i18n";
import type { ServicePage } from "@/types/content";

interface DesktopServicesDropdownProps {
  locale: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicePages: ServicePage[];
}

export function DesktopServicesDropdown({ locale, open, onOpenChange, servicePages }: DesktopServicesDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const items = getMobilePageNavigation(locale, { servicePages });
  const handleOpenChange = useEffectEvent(onOpenChange);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handleOpenChange(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        type="button"
        className={`nav-link nav-link--dropdown ${open ? "is-open" : ""}`}
        aria-expanded={open}
        aria-controls="services-dropdown-menu"
        onClick={() => onOpenChange(!open)}
      >
        {uiLabels[locale].services}
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
