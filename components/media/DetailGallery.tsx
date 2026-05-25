"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from "react-icons/fi";
import { MediaImage } from "@/components/MediaImage";
import type { Locale } from "@/lib/i18n";
import type { MediaAsset } from "@/types/content";

interface DetailGalleryProps {
  assets: MediaAsset[];
  locale: Locale;
  title: string;
}

function formatCounter(value: number) {
  return value.toString().padStart(2, "0");
}

export function DetailGallery({ assets, locale, title }: DetailGalleryProps) {
  const images = useMemo(() => {
    const uniqueAssets = new Map<string, MediaAsset>();

    assets.forEach((asset) => {
      if (asset.src) uniqueAssets.set(asset.src, asset);
    });

    return Array.from(uniqueAssets.values());
  }, [assets]);

  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const total = images.length;
  const activeImage = images[activeIndex] ?? images[0];

  function moveFullscreen(direction: 1 | -1) {
    setActiveIndex((current) => (current + direction + total) % total);
  }

  useEffect(() => {
    if (!isFullscreenOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFullscreenOpen(false);
      }

      if (event.key === "ArrowRight" && total > 1) {
        setActiveIndex((current) => (current + 1 + total) % total);
      }

      if (event.key === "ArrowLeft" && total > 1) {
        setActiveIndex((current) => (current - 1 + total) % total);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreenOpen, total]);

  if (!total) return null;

  function scrollToImage(index: number) {
    const nextIndex = Math.max(0, Math.min(index, total - 1));
    const target = railRef.current?.children.item(nextIndex) as HTMLElement | null;

    target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActiveIndex(nextIndex);
  }

  function handleScroll() {
    const rail = railRef.current;

    if (!rail) return;

    const railLeft = rail.getBoundingClientRect().left;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    Array.from(rail.children).forEach((child, index) => {
      const distance = Math.abs((child as HTMLElement).getBoundingClientRect().left - railLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }

  return (
    <>
      <section className="boat-detail-gallery" aria-labelledby="boat-detail-gallery-title">
        <div className="container boat-detail-gallery__header">
          <h2 id="boat-detail-gallery-title" className="detail-section-title">{title}</h2>
        </div>

        <div className="container boat-detail-gallery__container">
          <div className="boat-detail-gallery__viewport" ref={railRef} onScroll={handleScroll}>
            {images.map((asset, index) => (
              <figure className="boat-detail-gallery__item" key={asset.src}>
                <button type="button" className="boat-detail-gallery__trigger" onClick={() => {
                  setActiveIndex(index);
                  setIsFullscreenOpen(true);
                }} aria-label={`Abrir ${title.toLowerCase()} ${index + 1} a pantalla completa`}>
                  <MediaImage
                    asset={asset}
                    locale={locale}
                    sizes="(max-width: 767px) 82vw, (max-width: 1200px) 48vw, 46vw"
                    className="boat-detail-gallery__image"
                  />
                  <span className="boat-detail-gallery__expand" aria-hidden="true">
                    <FiMaximize2 />
                  </span>
                </button>
              </figure>
            ))}
          </div>

          <div className="boat-detail-gallery__controls" aria-label="Controles de galeria">
            <div className="boat-detail-gallery__fraction" aria-live="polite">
              <span>{formatCounter(activeIndex + 1)}</span>
              <span>/</span>
              <span>{formatCounter(total)}</span>
            </div>
            <div className="boat-detail-gallery__scrollbar" aria-hidden="true">
              <span style={{ width: `${((activeIndex + 1) / total) * 100}%` }} />
            </div>
            <div className="boat-detail-gallery__nav">
              <button type="button" onClick={() => scrollToImage(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Imagen anterior">
                <FiChevronLeft aria-hidden="true" />
              </button>
              <button type="button" onClick={() => scrollToImage(activeIndex + 1)} disabled={activeIndex === total - 1} aria-label="Imagen siguiente">
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {isFullscreenOpen && activeImage ? (
        <dialog className="media-lightbox" open aria-modal="true" aria-label={title}>
          <button type="button" className="media-lightbox__backdrop" onClick={() => setIsFullscreenOpen(false)} aria-label="Cerrar imagen" />
          <div className="media-lightbox__chrome">
            <div>
              <strong>{title}</strong>
              <span>{activeIndex + 1} / {total}</span>
            </div>
            <button type="button" className="media-lightbox__button" onClick={() => setIsFullscreenOpen(false)} aria-label="Cerrar imagen">
              <FiX aria-hidden="true" />
            </button>
          </div>
          <div className="media-lightbox__stage">
            <MediaImage asset={activeImage} locale={locale} sizes="100vw" priority className="media-lightbox__image" />
          </div>
          {total > 1 ? (
            <>
              <button type="button" className="media-lightbox__nav media-lightbox__nav--prev" onClick={() => moveFullscreen(-1)} aria-label="Imagen anterior">
                <FiChevronLeft aria-hidden="true" />
              </button>
              <button type="button" className="media-lightbox__nav media-lightbox__nav--next" onClick={() => moveFullscreen(1)} aria-label="Imagen siguiente">
                <FiChevronRight aria-hidden="true" />
              </button>
              <div className="media-lightbox__thumbs" aria-label="Imágenes disponibles">
                {images.map((item, index) => (
                  <button type="button" key={item.src} className={index === activeIndex ? "is-active" : ""} onClick={() => setActiveIndex(index)} aria-label={`Ver imagen ${index + 1}`} />
                ))}
              </div>
            </>
          ) : null}
        </dialog>
      ) : null}
    </>
  );
}
