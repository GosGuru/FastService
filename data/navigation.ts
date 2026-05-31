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
  const contact = getServicePage(content, "contact");
  const labels = uiLabels[locale];

  return [
    { label: labels.boats, href: `/${locale}#alquiler-barcos`, hasMegaMenu: true },
    { label: labels.transfers, href: `/${locale}/${transfers ? getLocalizedSlug(transfers.slugsByLocale, locale) : "transfer"}` },
    { label: labels.waterToys, href: `/${locale}/${waterToys ? getLocalizedSlug(waterToys.slugsByLocale, locale) : "water-toys"}` },
    { label: labels.security, href: `/${locale}/${security ? getLocalizedSlug(security.slugsByLocale, locale) : "security"}` },
    { label: labels.selfDriveVehicles, href: `/${locale}/${selfDrive ? getLocalizedSlug(selfDrive.slugsByLocale, locale) : "self-drive-car-rental"}` },
    { label: labels.contact, href: `/${locale}/${contact ? getLocalizedSlug(contact.slugsByLocale, locale) : "contact"}`, cta: true }
  ];
}

export function getMobilePageNavigation(locale: Locale, content?: NavigationContent) {
  const transfers = getServicePage(content, "transfers");
  const waterToys = getServicePage(content, "water-toys");
  const security = getServicePage(content, "security");
  const selfDrive = getServicePage(content, "self-drive");
  const transfersHref = `/${locale}/${transfers ? getLocalizedSlug(transfers.slugsByLocale, locale) : "transfer"}`;
  const waterToysHref = `/${locale}/${waterToys ? getLocalizedSlug(waterToys.slugsByLocale, locale) : "water-toys"}`;
  const securityHref = `/${locale}/${security ? getLocalizedSlug(security.slugsByLocale, locale) : "security"}`;
  const selfDriveHref = `/${locale}/${selfDrive ? getLocalizedSlug(selfDrive.slugsByLocale, locale) : "self-drive-car-rental"}`;

  if (locale === "es") {
    return [
      { label: "TRANSFER/SHUTTLE PRIVADO", href: transfersHref },
      { label: "WATER TAXI / TRANSFER ACUÁTICO", href: transfersHref },
      { label: "JUGUETES NÁUTICOS", href: waterToysHref },
      { label: "SEGURIDAD PRIVADA Y ESCOLTAS", href: securityHref },
      { label: "ALQUILER DE VEHÍCULOS SIN CONDUCTOR", href: selfDriveHref }
    ];
  }

  return getPrimaryNavigation(locale, content).filter((item) => !item.hasMegaMenu);
}

export function getBoatNavigation(locale: Locale, content?: NavigationContent) {
  return getBoatCollectionSource(content).map((collection) => ({
    id: collection.collectionId,
    label: getLocalizedValue(collection.title, locale),
    eyebrow: getLocalizedValue(collection.eyebrow, locale),
    description: getLocalizedValue(collection.description, locale),
    image: collection.image,
    href: `/${locale}/${getLocalizedSlug(collection.slugsByLocale, locale)}`
  }));
}
