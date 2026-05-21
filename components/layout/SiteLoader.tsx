"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NauticalLoaderMark } from "@/components/layout/NauticalLoaderMark";

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
  const hideTimer = useRef<number | null>(null);
  const maxTimer = useRef<number | null>(null);

  useEffect(() => {
    function startLoader() {
      clearTimer(hideTimer);
      clearTimer(maxTimer);
      startedAt.current = performance.now();
      setActive(true);

      maxTimer.current = window.setTimeout(() => {
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

    document.addEventListener("click", onDocumentClick, true);

    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      clearTimer(hideTimer);
      clearTimer(maxTimer);
    };
  }, []);

  useEffect(() => {
    if (!startedAt.current) {
      return;
    }

    clearTimer(hideTimer);
    clearTimer(maxTimer);

    const elapsedMs = performance.now() - startedAt.current;
    const remainingMs = Math.max(minVisibleMs - elapsedMs, 0);

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
