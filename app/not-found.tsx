import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { PremiumNotFoundContent } from "@/components/layout/PremiumNotFoundContent";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteLoader } from "@/components/layout/SiteLoader";
import { posts } from "@/data/posts";
import { getPublicContent } from "@/lib/content";
import { defaultLocale } from "@/lib/i18n";
import { createLanguageRouteMap } from "@/lib/language-routing";

export default async function NotFound() {
  const content = await getPublicContent();
  const languageRoutes = createLanguageRouteMap(content, posts);

  return (
    <>
      <SiteLoader />
      <SiteHeader locale={defaultLocale} boatCollections={content.boatCollections} servicePages={content.servicePages} languageRoutes={languageRoutes} />
      <PremiumNotFoundContent locale={defaultLocale} />
      <Footer locale={defaultLocale} servicePages={content.servicePages} />
      <FloatingWhatsApp locale={defaultLocale} />
    </>
  );
}
