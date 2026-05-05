import type { MetadataRoute } from "next";
import { getPublicContent } from "@/lib/content";
import { getLocalizedSlug, locales, siteUrl } from "@/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPublicRoutes = await getPublicContent();
  const urls: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    urls.push({ url: `${siteUrl}/${locale}`, lastModified: new Date() });

    allPublicRoutes.servicePages.forEach((page) => {
      urls.push({ url: `${siteUrl}/${locale}/${getLocalizedSlug(page.slugsByLocale, locale)}`, lastModified: page.updatedAt });
    });

    allPublicRoutes.boatCollections.forEach((collection) => {
      urls.push({ url: `${siteUrl}/${locale}/${getLocalizedSlug(collection.slugsByLocale, locale)}`, lastModified: collection.updatedAt });
    });

    allPublicRoutes.seoPages.forEach((page) => {
      urls.push({ url: `${siteUrl}/${locale}/${getLocalizedSlug(page.slugsByLocale, locale)}`, lastModified: page.updatedAt });
    });

    allPublicRoutes.vehicles.forEach((vehicle) => {
      const section = allPublicRoutes.servicePages.find((page) => page.serviceId === "transfers");
      if (section) urls.push({ url: `${siteUrl}/${locale}/${getLocalizedSlug(section.slugsByLocale, locale)}/${getLocalizedSlug(vehicle.slugsByLocale, locale)}`, lastModified: vehicle.updatedAt });
    });

    allPublicRoutes.waterToys.forEach((toy) => {
      const section = allPublicRoutes.servicePages.find((page) => page.serviceId === "water-toys");
      if (section) urls.push({ url: `${siteUrl}/${locale}/${getLocalizedSlug(section.slugsByLocale, locale)}/${getLocalizedSlug(toy.slugsByLocale, locale)}`, lastModified: toy.updatedAt });
    });

  });

  return urls;
}