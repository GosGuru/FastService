import { notFound } from "next/navigation";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { SiteLoader } from "@/components/layout/SiteLoader";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getPublicContent } from "@/lib/content";
import { isLocale, locales, type Locale } from "@/lib/i18n";

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

  return (
    <>
      <SiteLoader />
      <SiteHeader locale={locale} boatCollections={content.boatCollections} servicePages={content.servicePages} />
      {children}
      <Footer locale={locale} servicePages={content.servicePages} />
      <FloatingWhatsApp locale={locale} />
    </>
  );
}
