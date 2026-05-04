import { boatCollections } from "@/data/boatCollections";
import { servicePages } from "@/data/services";
import { getLocalizedSlug, getLocalizedValue, uiLabels, type Locale } from "@/lib/i18n";

export function getPrimaryNavigation(locale: Locale) {
  const transfers = servicePages.find((page) => page.serviceId === "transfers");
  const waterToys = servicePages.find((page) => page.serviceId === "water-toys");
  const contact = servicePages.find((page) => page.serviceId === "contact");
  const labels = uiLabels[locale];

  return [
    { label: labels.boats, href: `/${locale}#alquiler-barcos`, hasMegaMenu: true },
    { label: labels.transfers, href: `/${locale}/${transfers ? getLocalizedSlug(transfers.slugsByLocale, locale) : "transfer"}` },
    { label: labels.waterToys, href: `/${locale}/${waterToys ? getLocalizedSlug(waterToys.slugsByLocale, locale) : "water-toys"}` },
    { label: labels.contact, href: `/${locale}/${contact ? getLocalizedSlug(contact.slugsByLocale, locale) : "contact"}`, cta: true }
  ];
}

export function getBoatNavigation(locale: Locale) {
  return boatCollections.map((collection) => ({
    id: collection.collectionId,
    label: getLocalizedValue(collection.title, locale),
    eyebrow: getLocalizedValue(collection.eyebrow, locale),
    description: getLocalizedValue(collection.description, locale),
    image: collection.image,
    href: `/${locale}/${getLocalizedSlug(collection.slugsByLocale, locale)}`
  }));
}