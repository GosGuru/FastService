"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { uiLabels, type Locale } from "@/lib/i18n";

const desktopPoster = "/videos/loader/fastservices-loader-poster.jpg";
const mobilePoster = "/videos/loader/fastservices-loader-poster-mobile.jpg";
const revealDelayMs = 700;

function getRouteStatus(pathname: string | null, locale: Locale) {
  const route = pathname?.toLowerCase() ?? "";
  const labels = uiLabels[locale];

  if (route.includes("embarcaciones-rapidas") || route.includes("fast-boats") || route.includes("schnellboote") || route.includes("snelle") || route.includes("быстроходные")) {
    return labels.loaderStatusFastBoats;
  }

  if (route.includes("yates-xl") || route.includes("xl-yachts") || route.includes("xl-yachten") || route.includes("xl-jachten") || route.includes("яхты-xl")) {
    return labels.loaderStatusYachtsXl;
  }

  return labels.loaderStatusDefault;
}

interface PremiumRouteLoaderProps {
  locale: Locale;
}

export function PremiumRouteLoader({ locale }: PremiumRouteLoaderProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const status = useMemo(() => getRouteStatus(pathname, locale), [pathname, locale]);

  useEffect(() => {
    document.dispatchEvent(new Event("fastservice:route-pending"));
    const timer = window.setTimeout(() => {
      document.dispatchEvent(new Event("fastservice:fullscreen-loader"));
      setVisible(true);
    }, revealDelayMs);
    return () => {
      window.clearTimeout(timer);
      document.dispatchEvent(new Event("fastservice:route-ready"));
    };
  }, []);

  return (
    <main className="premium-loader premium-loader--still premium-loader--deferred" role="status" aria-live="polite" aria-label={status}>
      {visible && <picture className="premium-loader__poster">
        <source srcSet={mobilePoster} media="(orientation: portrait)" />
        <source srcSet={desktopPoster} media="(min-width: 761px)" />
        <img src={desktopPoster} alt="" draggable={false} />
      </picture>}
      <span className="premium-loader__shade premium-loader__shade--top" aria-hidden="true" />
      <span className="premium-loader__shade premium-loader__shade--bottom" aria-hidden="true" />
      <span className="premium-loader__grain" aria-hidden="true" />
      <div className="premium-loader__masthead">
        <p className="premium-loader__eyebrow">{uiLabels[locale].loaderMastheadEyebrow}</p>
        <h1 className="premium-loader__brand">FastServices Ibiza</h1>
      </div>
      <div className="premium-loader__dock">
        <p className="premium-loader__copy">{status}</p>
        <span className="premium-loader__progress" aria-hidden="true" />
      </div>
    </main>
  );
}
