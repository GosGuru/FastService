import { defaultLocale, getLocalizedSlug, isLocale, locales, normalizeSlugSegment, type Locale } from "@/lib/i18n";
import type { AdminContentSnapshot } from "@/lib/admin/snapshot";
import type { BlogPost, LocalizedText } from "@/types/content";

export type LanguageSlugs = Partial<Record<Locale, string>>;

export interface LanguageRouteMap {
  pages: LanguageSlugs[];
  posts: LanguageSlugs[];
  boatDetails: Array<{
    categorySlugsByLocale: LanguageSlugs;
    slugsByLocale: LanguageSlugs;
  }>;
  serviceItems: Array<{
    sectionSlugsByLocale: LanguageSlugs;
    slugsByLocale: LanguageSlugs;
  }>;
}

function compactSlugs(slugsByLocale: LocalizedText | undefined): LanguageSlugs {
  if (!slugsByLocale) return {};

  return Object.fromEntries(
    locales
      .map((locale) => [locale, getLocalizedSlug(slugsByLocale, locale).trim()] as const)
      .filter(([, slug]) => slug.length > 0)
  ) as LanguageSlugs;
}

function slugForLocale(slugsByLocale: LanguageSlugs, locale: Locale, fallback: string) {
  return slugsByLocale[locale] ?? slugsByLocale[defaultLocale] ?? slugsByLocale.en ?? fallback;
}

function slugsMatch(slugsByLocale: LanguageSlugs, locale: Locale, slug: string) {
  return slugForLocale(slugsByLocale, locale, "") === normalizeSlugSegment(slug);
}

export function createLanguageRouteMap(content: AdminContentSnapshot["content"], blogPosts: BlogPost[]): LanguageRouteMap {
  const collectionSlugsById = new Map(content.boatCollections.map((collection) => [collection.collectionId, collection.slugsByLocale]));
  const transferPage = content.servicePages.find((page) => page.serviceId === "transfers");
  const waterToyPage = content.servicePages.find((page) => page.serviceId === "water-toys");

  return {
    pages: [...content.boatCollections, ...content.servicePages, ...content.seoPages].map((page) => compactSlugs(page.slugsByLocale)),
    posts: blogPosts.map((post) => compactSlugs(post.slugsByLocale)),
    boatDetails: content.boats.map((boat) => ({
      categorySlugsByLocale: compactSlugs(collectionSlugsById.get(boat.collectionId) ?? boat.categorySlugsByLocale),
      slugsByLocale: compactSlugs(boat.slugsByLocale)
    })),
    serviceItems: [
      ...content.vehicles.map((vehicle) => ({
        sectionSlugsByLocale: compactSlugs(transferPage?.slugsByLocale),
        slugsByLocale: compactSlugs(vehicle.slugsByLocale)
      })),
      ...content.waterToys.map((toy) => ({
        sectionSlugsByLocale: compactSlugs(waterToyPage?.slugsByLocale),
        slugsByLocale: compactSlugs(toy.slugsByLocale)
      }))
    ]
  };
}

export function resolveLocalizedPath(pathname: string, activeLocale: Locale, targetLocale: Locale, routeMap?: LanguageRouteMap) {
  const segments = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean);
  const currentLocale = isLocale(segments[0] ?? "") ? (segments[0] as Locale) : activeLocale;
  const routeSegments = isLocale(segments[0] ?? "") ? segments.slice(1) : segments;
  const targetHome = `/${targetLocale}`;

  if (routeSegments.length === 0) return targetHome;

  if (routeSegments[0] === "blog") {
    if (routeSegments.length === 1) return `/${targetLocale}/blog`;

    const post = routeMap?.posts.find((item) => slugsMatch(item, currentLocale, routeSegments[1]));
    return post ? `/${targetLocale}/blog/${slugForLocale(post, targetLocale, routeSegments[1])}` : targetHome;
  }

  if (routeSegments[0] === "boat" && routeSegments.length >= 3) {
    const boat = routeMap?.boatDetails.find(
      (item) => slugsMatch(item.categorySlugsByLocale, currentLocale, routeSegments[1]) && slugsMatch(item.slugsByLocale, currentLocale, routeSegments[2])
    );

    return boat
      ? `/${targetLocale}/boat/${slugForLocale(boat.categorySlugsByLocale, targetLocale, routeSegments[1])}/${slugForLocale(boat.slugsByLocale, targetLocale, routeSegments[2])}`
      : targetHome;
  }

  if (routeSegments.length >= 2) {
    const serviceItem = routeMap?.serviceItems.find(
      (item) => slugsMatch(item.sectionSlugsByLocale, currentLocale, routeSegments[0]) && slugsMatch(item.slugsByLocale, currentLocale, routeSegments[1])
    );

    if (serviceItem) {
      return `/${targetLocale}/${slugForLocale(serviceItem.sectionSlugsByLocale, targetLocale, routeSegments[0])}/${slugForLocale(serviceItem.slugsByLocale, targetLocale, routeSegments[1])}`;
    }
  }

  const page = routeMap?.pages.find((item) => slugsMatch(item, currentLocale, routeSegments[0]));
  return page ? `/${targetLocale}/${slugForLocale(page, targetLocale, routeSegments[0])}` : targetHome;
}
