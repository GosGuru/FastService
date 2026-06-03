import { posts } from "@/data/posts";
import { getLocalizedSlug, getLocalizedValue, locales, normalizeSlugSegment, siteUrl, type Locale } from "@/lib/i18n";
import { loadPublicContentSnapshot } from "@/lib/supabase/content";
import type { BoatCollectionId, LocalizedText } from "@/types/content";

export function t(value: LocalizedText, locale: Locale) {
  return getLocalizedValue(value, locale);
}

export async function getPublicContent() {
  const result = await loadPublicContentSnapshot();

  return result.snapshot.content;
}

function matchesLocalizedSlug(slugsByLocale: LocalizedText, locale: Locale, slug: string) {
  return getLocalizedSlug(slugsByLocale, locale) === normalizeSlugSegment(slug);
}

export async function getBoatCollectionBySlug(locale: Locale, slug: string) {
  const content = await getPublicContent();

  return content.boatCollections.find((collection) => matchesLocalizedSlug(collection.slugsByLocale, locale, slug));
}

export async function getBoatCollectionById(collectionId: BoatCollectionId) {
  const content = await getPublicContent();

  return content.boatCollections.find((collection) => collection.collectionId === collectionId);
}

export async function getBoatsByCollection(collectionId: BoatCollectionId) {
  const content = await getPublicContent();

  return content.boats.filter((boat) => boat.collectionId === collectionId);
}

export async function getBoatBySlug(locale: Locale, categorySlug: string, boatSlug: string) {
  const content = await getPublicContent();

  return content.boats.find((boat) => {
    const collection = content.boatCollections.find((item) => item.collectionId === boat.collectionId);
    const categorySlugs = collection?.slugsByLocale ?? boat.categorySlugsByLocale;

    return matchesLocalizedSlug(categorySlugs, locale, categorySlug) && matchesLocalizedSlug(boat.slugsByLocale, locale, boatSlug);
  });
}

export async function getServicePageBySlug(locale: Locale, slug: string) {
  const content = await getPublicContent();

  return content.servicePages.find((page) => matchesLocalizedSlug(page.slugsByLocale, locale, slug));
}

export async function getPageBySlug(locale: Locale, slug: string) {
  const content = await getPublicContent();
  const collection = content.boatCollections.find((item) => matchesLocalizedSlug(item.slugsByLocale, locale, slug));
  if (collection) return collection;

  const service = content.servicePages.find((item) => matchesLocalizedSlug(item.slugsByLocale, locale, slug));
  if (service) return service;

  return content.seoPages.find((item) => matchesLocalizedSlug(item.slugsByLocale, locale, slug));
}

export async function getVehicleBySlug(locale: Locale, slug: string) {
  const content = await getPublicContent();

  return content.vehicles.find((vehicle) => matchesLocalizedSlug(vehicle.slugsByLocale, locale, slug));
}

export async function getWaterToyBySlug(locale: Locale, slug: string) {
  const content = await getPublicContent();

  return content.waterToys.find((toy) => matchesLocalizedSlug(toy.slugsByLocale, locale, slug));
}

export async function getItemBySectionAndSlug(locale: Locale, sectionSlug: string, itemSlug: string) {
  const content = await getPublicContent();
  const service = content.servicePages.find((page) => matchesLocalizedSlug(page.slugsByLocale, locale, sectionSlug));

  if (service?.serviceId === "transfers") {
    return content.vehicles.find((vehicle) => matchesLocalizedSlug(vehicle.slugsByLocale, locale, itemSlug));
  }

  if (service?.serviceId === "water-toys") {
    return content.waterToys.find((toy) => matchesLocalizedSlug(toy.slugsByLocale, locale, itemSlug));
  }

  return undefined;
}

export function getPostBySlug(locale: Locale, slug: string) {
  return posts.find((post) => matchesLocalizedSlug(post.slugsByLocale, locale, slug));
}

export async function getAllLocalizedStaticPaths() {
  const content = await getPublicContent();

  return locales.flatMap((locale) => [
    ...content.boatCollections.map((collection) => ({ locale, slug: getLocalizedSlug(collection.slugsByLocale, locale) })),
    ...content.servicePages.map((page) => ({ locale, slug: getLocalizedSlug(page.slugsByLocale, locale) })),
    ...content.seoPages.map((page) => ({ locale, slug: getLocalizedSlug(page.slugsByLocale, locale) }))
  ]);
}

export async function getAllLocalizedItemPaths() {
  const content = await getPublicContent();

  return locales.flatMap((locale) => {
    const transferPage = content.servicePages.find((page) => page.serviceId === "transfers");
    const waterToyPage = content.servicePages.find((page) => page.serviceId === "water-toys");
    const transferSlug = transferPage ? getLocalizedSlug(transferPage.slugsByLocale, locale) : undefined;
    const waterToySlug = waterToyPage ? getLocalizedSlug(waterToyPage.slugsByLocale, locale) : undefined;

    return [
      ...content.vehicles.map((vehicle) => ({ locale, slug: transferSlug ?? "transfer", itemSlug: getLocalizedSlug(vehicle.slugsByLocale, locale) })),
      ...content.waterToys.map((toy) => ({ locale, slug: waterToySlug ?? "water-toys", itemSlug: getLocalizedSlug(toy.slugsByLocale, locale) }))
    ];
  });
}

export async function getAllBoatPaths() {
  const content = await getPublicContent();

  return locales.flatMap((locale) =>
    content.boats.map((boat) => {
      const collection = content.boatCollections.find((item) => item.collectionId === boat.collectionId);
      const categorySlugs = collection?.slugsByLocale ?? boat.categorySlugsByLocale;

      return {
        locale,
        categorySlug: getLocalizedSlug(categorySlugs, locale),
        boatSlug: getLocalizedSlug(boat.slugsByLocale, locale)
      };
    })
  );
}

export function getAllPostPaths() {
  return locales.flatMap((locale) => posts.map((post) => ({ locale, slug: getLocalizedSlug(post.slugsByLocale, locale) })));
}

export function buildAlternates(slugsByLocale: LocalizedText, suffix = "") {
  return Object.fromEntries(
    locales.map((locale) => [locale, `${siteUrl}/${locale}/${getLocalizedSlug(slugsByLocale, locale)}${suffix}`])
  );
}

export function buildHomeAlternates() {
  return Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}/${locale}`]));
}


