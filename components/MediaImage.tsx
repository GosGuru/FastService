import Image from "next/image";
import { getLocalizedValue, type Locale } from "@/lib/i18n";
import type { MediaAsset } from "@/types/content";

interface MediaImageProps {
  asset: MediaAsset;
  locale: Locale;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function MediaImage({ asset, locale, className, sizes = "(max-width: 768px) 100vw, 33vw", priority }: MediaImageProps) {
  return (
    <Image
      src={asset.src}
      alt={getLocalizedValue(asset.alt, locale)}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}