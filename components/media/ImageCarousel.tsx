"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
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

    assets.filter((asset) => asset.src).forEach((asset) => uniqueAssets.set(asset.src, asset));

    return Array.from(uniqueAssets.values());
  }, [assets]);

  const [activeIndex, setActiveIndex] = useState(0);
  const image = images[activeIndex] ?? images[0];
  const hasManyImages = images.length > 1;

  function move(direction: 1 | -1) {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }

  if (!image) return null;

  return (
    <div className={`media-carousel ${className ?? ""}`}>
      <Link href={href} className="media-carousel__link" aria-label={ariaLabel}>
        <MediaImage asset={image} locale={locale} sizes={sizes} priority={priority} />
      </Link>
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
  );
}