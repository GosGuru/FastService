"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from "react-icons/fi";
import { MediaImage } from "@/components/MediaImage";
import type { Locale } from "@/lib/i18n";
import type { MediaAsset } from "@/types/content";

const carouselLabels: Record<Locale, {
  available: string;
  close: string;
  expand: string;
  next: string;
  previous: string;
  viewImage: (index: number, total: number) => string;
}> = {
  es: {
    available: "Imagenes disponibles",
    close: "Cerrar imagen",
    expand: "Abrir imagen a pantalla completa",
    next: "Imagen siguiente",
    previous: "Imagen anterior",
    viewImage: (index, total) => `Ver imagen ${index} de ${total}`
  },
  en: {
    available: "Available images",
    close: "Close image",
    expand: "Open image full screen",
    next: "Next image",
    previous: "Previous image",
    viewImage: (index, total) => `View image ${index} of ${total}`
  },
  de: {
    available: "Verfuegbare Bilder",
    close: "Bild schliessen",
    expand: "Bild im Vollbild oeffnen",
    next: "Naechstes Bild",
    previous: "Vorheriges Bild",
    viewImage: (index, total) => `Bild ${index} von ${total} ansehen`
  },
  nl: {
    available: "Beschikbare afbeeldingen",
    close: "Afbeelding sluiten",
    expand: "Afbeelding volledig openen",
    next: "Volgende afbeelding",
    previous: "Vorige afbeelding",
    viewImage: (index, total) => `Bekijk afbeelding ${index} van ${total}`
  },
  ru: {
    available: "Доступные изображения",
    close: "Закрыть изображение",
    expand: "Открыть изображение на весь экран",
    next: "Следующее изображение",
    previous: "Предыдущее изображение",
    viewImage: (index, total) => `Изображение ${index} из ${total}`
  }
};

interface ImageCarouselProps {
  assets: MediaAsset[];
  locale: Locale;
  href: string;
  ariaLabel: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showFullscreen?: boolean;
  variant?: "gallery" | "card";
}

export function ImageCarousel({ assets, locale, href, ariaLabel, className, sizes, priority, showFullscreen = true, variant = "gallery" }: ImageCarouselProps) {
  const images = useMemo(() => {
    const uniqueAssets = new Map<string, MediaAsset>();

    for (const asset of assets) {
      if (asset.src) uniqueAssets.set(asset.src, asset);
    }

    return Array.from(uniqueAssets.values());
  }, [assets]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const labels = carouselLabels[locale] ?? carouselLabels.es;
  const safeActiveIndex = images.length ? Math.min(activeIndex, images.length - 1) : 0;
  const image = images[safeActiveIndex];
  const hasManyImages = images.length > 1;

  const move = useCallback((direction: 1 | -1) => {
    if (!images.length) return;
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isFullscreenOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFullscreenOpen(false);
      }

      if (event.key === "ArrowRight" && images.length > 1) {
        move(1);
      }

      if (event.key === "ArrowLeft" && images.length > 1) {
        move(-1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreenOpen, images.length, move]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (!hasManyImages) return;

    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    didSwipeRef.current = false;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (!hasManyImages || touchStartXRef.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < 44) return;

    event.preventDefault();
    event.stopPropagation();
    didSwipeRef.current = true;
    move(deltaX < 0 ? 1 : -1);
  }

  if (!image) return null;

  return (
    <>
      <div className={`media-carousel media-carousel--${variant} ${className ?? ""}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <Link
          href={href}
          className="media-carousel__link"
          aria-label={ariaLabel}
          onClick={(event) => {
            if (!didSwipeRef.current) return;

            event.preventDefault();
            didSwipeRef.current = false;
          }}
        >
          <MediaImage asset={image} locale={locale} sizes={sizes} priority={priority} />
        </Link>
        {showFullscreen ? (
          <button type="button" className="media-carousel__expand" onClick={() => setIsFullscreenOpen(true)} aria-label={labels.expand}>
            <FiMaximize2 aria-hidden="true" />
          </button>
        ) : null}
        {hasManyImages ? (
          <>
            <button type="button" className="media-carousel__control media-carousel__control--prev" onClick={() => move(-1)} aria-label={labels.previous}>
              <FiChevronLeft aria-hidden="true" />
            </button>
            <button type="button" className="media-carousel__control media-carousel__control--next" onClick={() => move(1)} aria-label={labels.next}>
              <FiChevronRight aria-hidden="true" />
            </button>
            <div className="media-carousel__dots" aria-label={labels.available}>
              {images.map((item, index) => (
                <button
                  type="button"
                  key={item.src}
                  className={index === safeActiveIndex ? "is-active" : ""}
                  onClick={() => setActiveIndex(index)}
                  aria-label={labels.viewImage(index + 1, images.length)}
                />
              ))}
              <span className="media-carousel__counter" aria-hidden="true">{safeActiveIndex + 1}/{images.length}</span>
            </div>
          </>
        ) : null}
      </div>

      {isFullscreenOpen ? (
        <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={ariaLabel}>
          <button type="button" className="media-lightbox__backdrop" onClick={() => setIsFullscreenOpen(false)} aria-label={labels.close} />
          <div className="media-lightbox__chrome">
            <div>
              <strong>{ariaLabel}</strong>
              <span>{safeActiveIndex + 1} / {images.length}</span>
            </div>
            <button type="button" className="media-lightbox__button" onClick={() => setIsFullscreenOpen(false)} aria-label={labels.close}>
              <FiX aria-hidden="true" />
            </button>
          </div>
          <div className="media-lightbox__stage">
            <MediaImage asset={image} locale={locale} sizes="100vw" priority className="media-lightbox__image" />
          </div>
          {hasManyImages ? (
            <>
              <button type="button" className="media-lightbox__nav media-lightbox__nav--prev" onClick={() => move(-1)} aria-label={labels.previous}>
                <FiChevronLeft aria-hidden="true" />
              </button>
              <button type="button" className="media-lightbox__nav media-lightbox__nav--next" onClick={() => move(1)} aria-label={labels.next}>
                <FiChevronRight aria-hidden="true" />
              </button>
              <div className="media-lightbox__thumbs" aria-label={labels.available}>
                {images.map((item, index) => (
                  <button type="button" key={item.src} className={index === safeActiveIndex ? "is-active" : ""} onClick={() => setActiveIndex(index)} aria-label={labels.viewImage(index + 1, images.length)} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
