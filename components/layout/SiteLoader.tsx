"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NauticalLoaderMark } from "@/components/layout/NauticalLoaderMark";

const showDelayMs = 180;
const minVisibleMs = 280;
const maxVisibleMs = 1400;

type TimerRef = { current: number | null };

function clearTimer(timerRef: TimerRef) {
  if (timerRef.current) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function shouldStartLoader(event: MouseEvent, anchor: HTMLAnchorElement) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
    return false;
  }

  if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) {
    return false;
  }

  const nextUrl = new URL(anchor.href, window.location.href);

  if (nextUrl.origin !== window.location.origin) {
    return false;
  }

  const currentRoute = `${window.location.pathname}${window.location.search}`;
  const nextRoute = `${nextUrl.pathname}${nextUrl.search}`;

  return nextRoute !== currentRoute;
}

export function SiteLoader() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const startedAt = useRef(0);
  const fallbackPending = useRef(false);
  const hideTimer = useRef<number | null>(null);
  const showTimer = useRef<number | null>(null);
  const maxTimer = useRef<number | null>(null);

  useEffect(() => {
    function startLoader() {
      clearTimer(hideTimer);
      clearTimer(showTimer);
      clearTimer(maxTimer);
      startedAt.current = performance.now();
      setActive(false);
      showTimer.current = window.setTimeout(() => {
        showTimer.current = null;
        setActive(true);
      }, showDelayMs);

      maxTimer.current = window.setTimeout(() => {
        clearTimer(showTimer);
        startedAt.current = 0;
        setActive(false);
      }, maxVisibleMs);
    }

    function onDocumentClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement) || !shouldStartLoader(event, anchor)) {
        return;
      }

      startLoader();
    }

    function onFullscreenLoader() {
      clearTimer(hideTimer);
      clearTimer(showTimer);
      clearTimer(maxTimer);
      startedAt.current = 0;
      setActive(false);
    }

    function onRoutePending() {
      fallbackPending.current = true;
      if (!startedAt.current) startLoader();
    }

    function onRouteReady() {
      fallbackPending.current = false;
      onFullscreenLoader();
    }

    document.addEventListener("click", onDocumentClick, true);
    document.addEventListener("fastservice:route-pending", onRoutePending);
    document.addEventListener("fastservice:route-ready", onRouteReady);
    document.addEventListener("fastservice:fullscreen-loader", onFullscreenLoader);

    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      document.removeEventListener("fastservice:route-pending", onRoutePending);
      document.removeEventListener("fastservice:route-ready", onRouteReady);
      document.removeEventListener("fastservice:fullscreen-loader", onFullscreenLoader);
      clearTimer(hideTimer);
      clearTimer(showTimer);
      clearTimer(maxTimer);
    };
  }, []);

  useEffect(() => {
    if (!startedAt.current || fallbackPending.current) {
      return;
    }

    clearTimer(hideTimer);
    clearTimer(maxTimer);

    const elapsedMs = performance.now() - startedAt.current;
    if (showTimer.current !== null) {
      clearTimer(showTimer);
      startedAt.current = 0;
      setActive(false);
      return;
    }
    const remainingMs = Math.max(showDelayMs + minVisibleMs - elapsedMs, 0);

    hideTimer.current = window.setTimeout(() => {
      startedAt.current = 0;
      setActive(false);
    }, remainingMs);
  }, [pathname]);

  return (
    <div className={`site-loader ${active ? "is-active" : ""}`} aria-hidden="true">
      <span className="site-loader__track">
        <span className="site-loader__bar" />
      </span>
      <span className="site-loader__craft">
        <NauticalLoaderMark compact />
      </span>
    </div>
  );
}
