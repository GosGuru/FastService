import { useWhatsAppSettings } from "@/components/providers/WhatsAppSettingsProvider";
import type { Locale } from "@/lib/i18n";

export function useWhatsAppPhone(locale: Locale): string {
  const { getPhone } = useWhatsAppSettings();
  return getPhone(locale);
}
