import { boatCollections } from "@/data/boatCollections";
import { boats } from "@/data/boats";
import { posts } from "@/data/posts";
import { servicePages } from "@/data/services";
import { vehicles } from "@/data/vehicles";
import { waterToys } from "@/data/waterToys";
import { getLocalizedSlug, getLocalizedValue, locales, siteUrl, type Locale } from "@/lib/i18n";
import type { BoatCollectionId, LocalizedText } from "@/types/content";

export function t(value: LocalizedText, locale: Locale) {
  return getLocalizedValue(value, locale);
}

export function getBoatCollectionBySlug(locale: Locale, slug: string) {
  return boatCollections.find((collection) => getLocalizedSlug(collection.slugsByLocale, locale) === slug);
}

export function getBoatCollectionById(collectionId: BoatCollectionId) {
  return boatCollections.find((collection) => collection.collectionId === collectionId);
}

export function getBoatsByCollection(collectionId: BoatCollectionId) {
  return boats.filter((boat) => boat.collectionId === collectionId);
}

export function getBoatBySlug(locale: Locale, categorySlug: string, boatSlug: string) {
  return boats.find(
    (boat) =>
      getLocalizedSlug(boat.categorySlugsByLocale, locale) === categorySlug && getLocalizedSlug(boat.slugsByLocale, locale) === boatSlug
  );
}

export function getServicePageBySlug(locale: Locale, slug: string) {
  return servicePages.find((page) => getLocalizedSlug(page.slugsByLocale, locale) === slug);
}

export function getPageBySlug(locale: Locale, slug: string) {
  const collection = getBoatCollectionBySlug(locale, slug);
  if (collection) return collection;

  return getServicePageBySlug(locale, slug);
}

export function getVehicleBySlug(locale: Locale, slug: string) {
  return vehicles.find((vehicle) => getLocalizedSlug(vehicle.slugsByLocale, locale) === slug);
}

export function getWaterToyBySlug(locale: Locale, slug: string) {
  return waterToys.find((toy) => getLocalizedSlug(toy.slugsByLocale, locale) === slug);
}

export function getItemBySectionAndSlug(locale: Locale, sectionSlug: string, itemSlug: string) {
  const service = getServicePageBySlug(locale, sectionSlug);

  if (service?.serviceId === "transfers") {
    return getVehicleBySlug(locale, itemSlug);
  }

  if (service?.serviceId === "water-toys") {
    return getWaterToyBySlug(locale, itemSlug);
  }

  return undefined;
}

export function getPostBySlug(locale: Locale, slug: string) {
  return posts.find((post) => getLocalizedSlug(post.slugsByLocale, locale) === slug);
}

export function getAllLocalizedStaticPaths() {
  return locales.flatMap((locale) => [
    ...boatCollections.map((collection) => ({ locale, slug: getLocalizedSlug(collection.slugsByLocale, locale) })),
    ...servicePages.map((page) => ({ locale, slug: getLocalizedSlug(page.slugsByLocale, locale) }))
  ]);
}

export function getAllLocalizedItemPaths() {
  return locales.flatMap((locale) => {
    const transferPage = servicePages.find((page) => page.serviceId === "transfers");
    const waterToyPage = servicePages.find((page) => page.serviceId === "water-toys");
    const transferSlug = transferPage ? getLocalizedSlug(transferPage.slugsByLocale, locale) : undefined;
    const waterToySlug = waterToyPage ? getLocalizedSlug(waterToyPage.slugsByLocale, locale) : undefined;

    return [
      ...vehicles.map((vehicle) => ({ locale, slug: transferSlug ?? "transfer", itemSlug: getLocalizedSlug(vehicle.slugsByLocale, locale) })),
      ...waterToys.map((toy) => ({ locale, slug: waterToySlug ?? "water-toys", itemSlug: getLocalizedSlug(toy.slugsByLocale, locale) }))
    ];
  });
}

export function getAllBoatPaths() {
  return locales.flatMap((locale) =>
    boats.map((boat) => ({
      locale,
      categorySlug: getLocalizedSlug(boat.categorySlugsByLocale, locale),
      boatSlug: getLocalizedSlug(boat.slugsByLocale, locale)
    }))
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

export const allPublicRoutes = {
  boatCollections,
  boats,
  servicePages,
  vehicles,
  waterToys,
  posts
};