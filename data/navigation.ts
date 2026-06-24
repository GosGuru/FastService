import { boatCollections } from "@/data/boatCollections";
import { servicePages } from "@/data/services";
import { getLocalizedSlug, getLocalizedValue, uiLabels, type Locale } from "@/lib/i18n";
import type { BoatCollection, ServicePage } from "@/types/content";

interface NavigationContent {
  boatCollections?: BoatCollection[];
  servicePages?: ServicePage[];
}

function getBoatCollectionSource(content?: NavigationContent) {
  return content?.boatCollections?.length ? content.boatCollections : boatCollections;
}

function getServicePageSource(content?: NavigationContent) {
  return content?.servicePages?.length ? content.servicePages : servicePages;
}

function getServicePage(content: NavigationContent | undefined, serviceId: string) {
  return getServicePageSource(content).find((page) => page.serviceId === serviceId);
}

export function getPrimaryNavigation(locale: Locale, content?: NavigationContent) {
  const transfers = getServicePage(content, "transfers");
  const waterToys = getServicePage(content, "water-toys");
  const security = getServicePage(content, "security");
  const selfDrive = getServicePage(content, "self-drive");
  const labels = uiLabels[locale];

  return [
    { label: labels.boats, href: `/${locale}#alquiler-barcos`, hasMegaMenu: true },
    { label: labels.transfers, href: `/${locale}/${transfers ? getLocalizedSlug(transfers.slugsByLocale, locale) : "transfer"}` },
    { label: labels.waterToys, href: `/${locale}/${waterToys ? getLocalizedSlug(waterToys.slugsByLocale, locale) : "water-toys"}` },
    { label: labels.security, href: `/${locale}/${security ? getLocalizedSlug(security.slugsByLocale, locale) : "security"}` },
    { label: labels.selfDriveVehicles, href: `/${locale}/${selfDrive ? getLocalizedSlug(selfDrive.slugsByLocale, locale) : "self-drive-car-rental"}` },
  ];
}

export function getMobilePageNavigation(locale: Locale, content?: NavigationContent) {
  const transfers = getServicePage(content, "transfers");
  const waterToys = getServicePage(content, "water-toys");
  const security = getServicePage(content, "security");
  const selfDrive = getServicePage(content, "self-drive");
  const waterTaxi = getServicePage(content, "water-taxi");
  const transfersHref = `/${locale}/${transfers ? getLocalizedSlug(transfers.slugsByLocale, locale) : "transfer"}`;
  const waterToysHref = `/${locale}/${waterToys ? getLocalizedSlug(waterToys.slugsByLocale, locale) : "water-toys"}`;
  const securityHref = `/${locale}/${security ? getLocalizedSlug(security.slugsByLocale, locale) : "security"}`;
  const selfDriveHref = `/${locale}/${selfDrive ? getLocalizedSlug(selfDrive.slugsByLocale, locale) : "self-drive-car-rental"}`;
  const waterTaxiHref = `/${locale}/${waterTaxi ? getLocalizedSlug(waterTaxi.slugsByLocale, locale) : "taxi-boat"}`;

  if (locale === "es") {
    return [
      { label: "TRANSFER/SHUTTLE PRIVADO", href: transfersHref },
      { label: "TAXI BOAT", href: waterTaxiHref },
      { label: "JUGUETES NÁUTICOS", href: waterToysHref },
      { label: "SEGURIDAD PRIVADA Y ESCOLTAS", href: securityHref },
      { label: "ALQUILER DE VEHÍCULOS SIN CONDUCTOR", href: selfDriveHref }
    ];
  }

  return getPrimaryNavigation(locale, content).filter((item) => !item.hasMegaMenu);
}

function formatPriceTag(value: string, locale: Locale): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const isNumeric = /^[0-9.,\s€$]+$/.test(trimmed);

  if (isNumeric) {
    const prefixes: Record<Locale, string> = {
      es: "Desde",
      en: "From",
      de: "Ab",
      nl: "Vanaf",
      ru: "От"
    };
    const prefix = prefixes[locale] ?? "Desde";

    const hasDollar = trimmed.includes("$");
    const cleanNumber = trimmed.replace(/[€$]/g, "").trim();

    if (hasDollar) {
      return `${prefix} $${cleanNumber}`;
    } else {
      return `${prefix} ${cleanNumber}€`;
    }
  }

  return trimmed;
}

export function getBoatNavigation(locale: Locale, content?: NavigationContent) {
  return getBoatCollectionSource(content).map((collection) => ({
    id: collection.collectionId,
    label: getLocalizedValue(collection.title, locale),
    eyebrow: getLocalizedValue(collection.eyebrow, locale),
    description: getLocalizedValue(collection.description, locale),
    image: collection.image,
    href: `/${locale}/${getLocalizedSlug(collection.slugsByLocale, locale)}`,
    priceTag: collection.priceTag ? formatPriceTag(getLocalizedValue(collection.priceTag, locale), locale) : undefined
  }));
}
