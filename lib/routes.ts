import { boatCollections } from "@/data/boatCollections";
import { servicePages } from "@/data/services";
import { vehicles } from "@/data/vehicles";
import { waterToys } from "@/data/waterToys";
import { getLocalizedSlug, type Locale } from "@/lib/i18n";

export function getLocalizedHref(locale: Locale, slugsByLocale: Record<Locale, string>) {
  return `/${locale}/${getLocalizedSlug(slugsByLocale, locale)}`;
}

export function getServiceSectionSlug(serviceId: "transfers" | "water-toys", locale: Locale) {
  const service = servicePages.find((page) => page.serviceId === serviceId);
  return service ? getLocalizedSlug(service.slugsByLocale, locale) : serviceId;
}

export function getBoatCollectionPath(collectionId: string, locale: Locale) {
  const collection = boatCollections.find((item) => item.collectionId === collectionId);
  return collection ? `/${locale}/${getLocalizedSlug(collection.slugsByLocale, locale)}` : `/${locale}`;
}

export function getVehiclePath(vehicleId: string, locale: Locale) {
  const sectionSlug = getServiceSectionSlug("transfers", locale);
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  return vehicle ? `/${locale}/${sectionSlug}/${getLocalizedSlug(vehicle.slugsByLocale, locale)}` : `/${locale}/${sectionSlug}`;
}

export function getWaterToyPath(toyId: string, locale: Locale) {
  const sectionSlug = getServiceSectionSlug("water-toys", locale);
  const toy = waterToys.find((item) => item.id === toyId);
  return toy ? `/${locale}/${sectionSlug}/${getLocalizedSlug(toy.slugsByLocale, locale)}` : `/${locale}/${sectionSlug}`;
}