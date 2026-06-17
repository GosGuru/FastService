"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { MediaImage } from "@/components/MediaImage";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useWhatsAppPhone } from "@/lib/useWhatsAppSettings";
import type { Locale } from "@/lib/i18n";
import type { MediaAsset } from "@/types/content";

interface TaxiBoatHeroProps {
  title: string;
  description: string;
  whatsappMessage: string;
  image: MediaAsset;
  locale: Locale;
}

const ctaLabel: Record<Locale, string> = {
  es: "Solicitar Taxi Boat",
  en: "Request Taxi Boat",
  de: "Taxi Boot anfragen",
  nl: "Taxi Boot aanvragen",
  ru: "Заказать водное такси"
};

export function TaxiBoatHero({ title, description, whatsappMessage, image, locale }: TaxiBoatHeroProps) {
  useEffect(() => {
    document.body.classList.add("taxi-boat-fullscreen");
    return () => {
      document.body.classList.remove("taxi-boat-fullscreen");
    };
  }, []);

  const phone = useWhatsAppPhone(locale);
  const whatsappHref = buildWhatsAppUrl(whatsappMessage, locale, phone);

  return (
    <div className="taxi-boat-hero">
      {/* Imagen de fondo */}
      <div className="taxi-boat-hero__media" aria-hidden="true">
        {image.src ? (
          <MediaImage asset={image} locale={locale} sizes="100vw" priority />
        ) : (
          <div className="taxi-boat-hero__media-fallback" />
        )}
      </div>

      {/* Overlay con gradiente oscuro */}
      <div className="taxi-boat-hero__overlay" aria-hidden="true" />

      {/* Contenido central */}
      <div className="taxi-boat-hero__content">
        <h1 className="taxi-boat-hero__title">{title}</h1>
        {description && (
          <p className="taxi-boat-hero__description">{description}</p>
        )}
        <Link
          href={whatsappHref}
          className="taxi-boat-hero__cta"
          target="_blank"
          rel="noreferrer"
        >
          <FaWhatsapp aria-hidden="true" />
          <span>{ctaLabel[locale]}</span>
        </Link>
      </div>
    </div>
  );
}
