"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type LoaderVideoVariant = "desktop" | "mobile";

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

const desktopPoster = "/videos/loader/fastservices-loader-poster.jpg";
const mobilePoster = "/videos/loader/fastservices-loader-poster-mobile.jpg";

function getRouteStatus(pathname: string | null) {
  const route = pathname?.toLowerCase() ?? "";

  if (route.includes("embarcaciones-rapidas")) {
    return "Preparando embarcaciones rápidas";
  }

  if (route.includes("yates-xl")) {
    return "Preparando Yates XL";
  }

  return "Preparando tu experiencia náutica privada";
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function prefersSaveData() {
  const navigatorWithConnection = window.navigator as NavigatorWithConnection;
  return navigatorWithConnection.connection?.saveData === true;
}

function getPreferredVariant(): LoaderVideoVariant {
  if (window.innerWidth <= 760 || window.innerHeight > window.innerWidth) {
    return "mobile";
  }

  return "desktop";
}

function canPlayDecorativeVideo() {
  return !prefersReducedMotion() && !prefersSaveData();
}

function addMotionListener(query: MediaQueryList, listener: () => void) {
  query.addEventListener("change", listener);

  return () => query.removeEventListener("change", listener);
}

export function PremiumRouteLoader() {
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoVariant, setVideoVariant] = useState<LoaderVideoVariant | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isStillMode, setIsStillMode] = useState(false);
  const status = useMemo(() => getRouteStatus(pathname), [pathname]);

  useEffect(() => {
    let resizeFrame = 0;

    const updateVideoMode = () => {
      if (!canPlayDecorativeVideo()) {
        setIsStillMode(true);
        setIsVideoReady(false);
        setVideoVariant(null);
        return;
      }

      const nextVariant = getPreferredVariant();
      setIsStillMode(false);
      setVideoVariant((currentVariant) => {
        if (currentVariant !== nextVariant) {
          setIsVideoReady(false);
        }

        return nextVariant;
      });
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(updateVideoMode);
    };

    updateVideoMode();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const removeMotionListener = addMotionListener(motionQuery, updateVideoMode);

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("orientationchange", updateVideoMode);

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      removeMotionListener();
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", updateVideoMode);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!videoVariant || !video) return;

    let cancelled = false;
    const playAttempt = video.play();

    playAttempt.catch(() => {
      if (!cancelled) {
        setIsStillMode(true);
        setVideoVariant(null);
      }
    });

    return () => {
      cancelled = true;
      video.pause();
    };
  }, [videoVariant]);

  const poster = videoVariant === "mobile" ? mobilePoster : desktopPoster;

  return (
    <main
      className={`premium-loader${isVideoReady ? " premium-loader--ready" : ""}${isStillMode ? " premium-loader--still" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={status}
    >
      <picture className="premium-loader__poster">
        <source srcSet={mobilePoster} media="(orientation: portrait)" />
        <source srcSet={desktopPoster} media="(min-width: 761px)" />
        <img src={desktopPoster} alt="" draggable={false} />
      </picture>

      {videoVariant ? (
        <video
          key={videoVariant}
          ref={videoRef}
          className={`premium-loader__video premium-loader__video--${videoVariant}`}
          poster={poster}
          muted
          autoPlay
          playsInline
          loop
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setIsVideoReady(true)}
          onPlaying={() => setIsVideoReady(true)}
          onError={() => {
            setIsStillMode(true);
            setVideoVariant(null);
          }}
        >
          {videoVariant === "mobile" ? (
            <>
              <source src="/videos/loader/fastservices-loader-mobile.webm" type="video/webm" />
              <source src="/videos/loader/fastservices-loader-mobile.mp4" type="video/mp4" />
            </>
          ) : (
            <>
              <source src="/videos/loader/fastservices-loader-desktop.webm" type="video/webm" />
              <source src="/videos/loader/fastservices-loader-desktop.mp4" type="video/mp4" />
            </>
          )}
        </video>
      ) : null}

      <span className="premium-loader__shade premium-loader__shade--top" aria-hidden="true" />
      <span className="premium-loader__shade premium-loader__shade--bottom" aria-hidden="true" />
      <span className="premium-loader__grain" aria-hidden="true" />

      <div className="premium-loader__masthead">
        <p className="premium-loader__eyebrow">Private nautical service</p>
        <h1 className="premium-loader__brand">FastServices Ibiza</h1>
      </div>

      <div className="premium-loader__dock">
        <p className="premium-loader__copy">{status}</p>
        <span className="premium-loader__progress" aria-hidden="true" />
      </div>
    </main>
  );
}
