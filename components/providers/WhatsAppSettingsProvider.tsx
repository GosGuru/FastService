"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/types/settings";
import { getWhatsAppNumber } from "@/types/settings";

interface WhatsAppSettingsContextValue {
  getPhone: (locale: Locale) => string;
}

const WhatsAppSettingsContext = createContext<WhatsAppSettingsContextValue>({
  getPhone: (locale) => {
    console.warn(`WhatsAppSettingsProvider not found, using default phone for ${locale}`);
    return "34655835803";
  }
});

export function WhatsAppSettingsProvider({
  settings,
  children
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({
    getPhone: (locale: Locale) => getWhatsAppNumber(settings, locale)
  }), [settings]);

  return (
    <WhatsAppSettingsContext.Provider value={value}>
      {children}
    </WhatsAppSettingsContext.Provider>
  );
}

export function useWhatsAppSettings(): WhatsAppSettingsContextValue {
  return useContext(WhatsAppSettingsContext);
}
