import { notFound } from "next/navigation";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { SiteLoader } from "@/components/layout/SiteLoader";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { posts } from "@/data/posts";
import { getPublicContent } from "@/lib/content";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { createLanguageRouteMap } from "@/lib/language-routing";
import { loadSiteSettings } from "@/lib/siteSettings";
import { WhatsAppSettingsProvider } from "@/components/providers/WhatsAppSettingsProvider";
import { getWhatsAppNumber } from "@/types/settings";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const content = await getPublicContent();
  const languageRoutes = createLanguageRouteMap(content, posts);
  const settings = await loadSiteSettings();
  const phone = getWhatsAppNumber(settings, locale);

  return (
    <WhatsAppSettingsProvider settings={settings}>
      <SiteLoader />
      <SiteHeader locale={locale} boatCollections={content.boatCollections} servicePages={content.servicePages} languageRoutes={languageRoutes} />
      {children}
      <Footer locale={locale} servicePages={content.servicePages} phone={phone} />
      <FloatingWhatsApp locale={locale} phone={phone} />
    </WhatsAppSettingsProvider>
  );
}
