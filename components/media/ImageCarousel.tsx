"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from "react-icons/fi";
import { MediaImage } from "@/components/MediaImage";
import type { Locale } from "@/lib/i18n";
import type { MediaAsset } from "@/types/content";

interface ImageCarouselProps {
  assets: MediaAsset[];
  locale: Locale;
  href: string;
  ariaLabel: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ImageCarousel({ assets, locale, href, ariaLabel, className, sizes, priority }: ImageCarouselProps) {
  const images = useMemo(() => {
    const uniqueAssets = new Map<string, MediaAsset>();

    for (const asset of assets) {
      if (asset.src) uniqueAssets.set(asset.src, asset);
    }

    return Array.from(uniqueAssets.values());
  }, [assets]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const image = images[activeIndex] ?? images[0];
  const hasManyImages = images.length > 1;

  const move = useCallback((direction: 1 | -1) => {
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

  if (!image) return null;

  return (
    <>
      <div className={`media-carousel ${className ?? ""}`}>
        <Link href={href} className="media-carousel__link" aria-label={ariaLabel}>
          <MediaImage asset={image} locale={locale} sizes={sizes} priority={priority} />
        </Link>
        <button type="button" className="media-carousel__expand" onClick={() => setIsFullscreenOpen(true)} aria-label="Abrir imagen a pantalla completa">
          <FiMaximize2 aria-hidden="true" />
        </button>
        {hasManyImages ? (
          <>
            <button type="button" className="media-carousel__control media-carousel__control--prev" onClick={() => move(-1)} aria-label="Imagen anterior">
              <FiChevronLeft aria-hidden="true" />
            </button>
            <button type="button" className="media-carousel__control media-carousel__control--next" onClick={() => move(1)} aria-label="Imagen siguiente">
              <FiChevronRight aria-hidden="true" />
            </button>
            <div className="media-carousel__dots" aria-label="Imágenes disponibles">
              {images.map((item, index) => (
                <button
                  type="button"
                  key={item.src}
                  className={index === activeIndex ? "is-active" : ""}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ver imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {isFullscreenOpen ? (
        <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={ariaLabel}>
          <button type="button" className="media-lightbox__backdrop" onClick={() => setIsFullscreenOpen(false)} aria-label="Cerrar imagen" />
          <div className="media-lightbox__chrome">
            <div>
              <strong>{ariaLabel}</strong>
              <span>{activeIndex + 1} / {images.length}</span>
            </div>
            <button type="button" className="media-lightbox__button" onClick={() => setIsFullscreenOpen(false)} aria-label="Cerrar imagen">
              <FiX aria-hidden="true" />
            </button>
          </div>
          <div className="media-lightbox__stage">
            <MediaImage asset={image} locale={locale} sizes="100vw" priority className="media-lightbox__image" />
          </div>
          {hasManyImages ? (
            <>
              <button type="button" className="media-lightbox__nav media-lightbox__nav--prev" onClick={() => move(-1)} aria-label="Imagen anterior">
                <FiChevronLeft aria-hidden="true" />
              </button>
              <button type="button" className="media-lightbox__nav media-lightbox__nav--next" onClick={() => move(1)} aria-label="Imagen siguiente">
                <FiChevronRight aria-hidden="true" />
              </button>
              <div className="media-lightbox__thumbs" aria-label="Imágenes disponibles">
                {images.map((item, index) => (
                  <button type="button" key={item.src} className={index === activeIndex ? "is-active" : ""} onClick={() => setActiveIndex(index)} aria-label={`Ver imagen ${index + 1}`} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}