export const locales = ["es", "en", "de", "nl", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const languageNames: Record<Locale, string> = {
	es: "ES",
	en: "EN",
	de: "DE",
	nl: "NL",
	ru: "RU",
};

export const languageOptions = [
	{ locale: "en", code: "EN", name: "English" },
	{ locale: "de", code: "DE", name: "Deutsch" },
	{ locale: "es", code: "ES", name: "Español" },
	{ locale: "nl", code: "NL", name: "Nederlands" },
	{ locale: "ru", code: "RU", name: "Русский" },
] satisfies Array<{ locale: Locale; code: string; name: string }>;

export type LocalizedValue = Partial<Record<Locale, string>> & {
	es?: string;
	en?: string;
};

export const siteUrl =
	process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
	"https://fastservices.example";

export function isLocale(value: string): value is Locale {
	return locales.includes(value as Locale);
}

export function assertLocale(value: string): Locale {
	return isLocale(value) ? value : defaultLocale;
}

export function getLocalizedValue(value: LocalizedValue, locale: Locale) {
	return value[locale] ?? value[defaultLocale] ?? value.en ?? "";
}

function decodeSlugSegment(value: string) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export function normalizeSlugSegment(value: string) {
	return decodeSlugSegment(value)
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/['’]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function getLocalizedSlug(value: LocalizedValue, locale: Locale) {
	return normalizeSlugSegment(getLocalizedValue(value, locale));
}

export function localizedPath(locale: Locale, path = ""): string {
	const cleanPath = path.startsWith("/") ? path : `/${path}`;
	return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}

export function applyTemplate(
	template: string,
	replacements: Record<string, string | number>,
) {
	return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
		String(replacements[key] ?? ""),
	);
}

export const uiLabels = {
	es: {
		services: "Servicios",
		boats: "Alquiler de barcos",
		mobileBoatsTab: "Alquiler de yates",
		mobilePagesTab: "Servicios",
		transfers: "Transfer privado",
		waterToys: "Juguetes náuticos",
		security: "Seguridad",
		selfDriveVehicles: "Vehículos sin conductor",
		news: "Noticias",
		contact: "Contacto",
		availability: "Consultar disponibilidad",
		viewFleet: "Ver selección",
		exploreFleet: "Explora nuestra flota",
		whatsapp: "WhatsApp",
		menu: "Abrir menú",
		close: "Cerrar menú",
		language: "Cambiar idioma",
		passengers: "Pasajeros",
		cabins: "Cabinas",
		length: "Eslora",
		bathrooms: "Baños",
		from: "Desde",
		noPrices: "Disponibilidad y propuesta a medida por WhatsApp",
		loaderStatusDefault: "Preparando tu experiencia náutica privada",
		loaderStatusFastBoats: "Preparando embarcaciones rápidas",
		loaderStatusYachtsXl: "Preparando Yates XL",
		loaderMastheadEyebrow: "Private nautical service",
		errorEyebrow: "No encontramos esto",
		errorTitle: "Ups, parece que lo que buscabas no está disponible.",
		errorDescription:
			"Puede que el enlace haya cambiado o que esa ficha ya no esté publicada. Puedes seguir navegando desde acá.",
		errorQuestion: "¿Qué quieres hacer ahora?",
		errorNote: "Si buscabas una reserva concreta, te ayudamos por WhatsApp.",
		errorHome: "Ir al inicio",
		errorBoats: "Ver barcos disponibles",
		errorWhatsApp: "Escribir por WhatsApp",
		errorActionsAriaLabel: "Opciones para continuar",
		footerTagline:
			"Ibiza lifestyle management para mar, movilidad y experiencias.",
		footerAdmin: "Admin",
		ariaPrimaryNavigation: "Primary navigation",
		ariaBoatCollections: "Colecciones de barcos",
		ariaHome: "FastServices – Home",
		galleryOpenFullscreen: "Abrir {{title}} {{index}} a pantalla completa",
		galleryControlsAriaLabel: "Controles de galeria",
		galleryPreviousImage: "Imagen anterior",
		galleryNextImage: "Imagen siguiente",
		galleryCloseImage: "Cerrar imagen",
		galleryAvailableImages: "Imágenes disponibles",
		galleryViewImage: "Ver imagen {{index}}",
		megaMenuRentInIbiza: "Alquiler de {{label}} en Ibiza",
		homeHeroTitle: "Ibiza Lifestyle Management",
		homeFinalCtaEyebrow: "FastServices",
		homeFinalCtaTitle: "Dinos qué quieres vivir en Ibiza",
		homeFinalCtaDescription:
			"Te respondemos con disponibilidad real y una propuesta personalizada.",
		homeMetadataDescription:
			"Barcos, transfers privados y juguetes náuticos coordinados desde una sola conversación",
		blogMetadataDescription:
			"Noticias, novedades y consejos para disfrutar Ibiza y Formentera desde el mar.",
		contactGreeting:
			"Hola, quiero recibir asesoramiento para una experiencia en Ibiza.",
		detailBook: "Reservar",
		detailDescription: "Descripción",
		detailEquipment: "Equipamiento",
		detailGallery: "Galería",
		detailVideo: "Video",
		detailRelatedPrefix: "Otros",
		detailRelatedSuffix: "en alquiler",
		detailHome: "Inicio",
		detailTransfer: "Transfer privado",
		detailWaterToy: "Juguete náutico",
		transfersFleetEyebrow: "Descubre nuestra flota",
		transfersFleetTitle:
			"Vehículos con chófer para cada momento que necesites en las Islas Baleares",
		transfersStaffNote:
			"Todo el personal debidamente uniformado, aseado y con sus respectivas licencias de conducir en regla.",
		transfersDocNote:
			"Todos los vehículos tendrán toda la documentación en vigor.",
		securityPersonnelTitle: "Personal Cualificado con tarjetas TIP",
		securityPersonnelDescription:
			"Todo el personal debidamente uniformado, aseado y con sus respectivos equipos de seguridad.\nTodos los TIP (tarjetas de identificación profesional) estarán en vigor y revisadas.",
		boatCollectionHeroTitlePrefix: "Explora Nuestra Colección de ",
		boatCollectionHeroTitleSuffix: "",
	},
	en: {
		services: "Services",
		boats: "Boat rentals",
		mobileBoatsTab: "Yacht rentals",
		mobilePagesTab: "Services",
		transfers: "Private transfers",
		waterToys: "Water toys",
		security: "Security",
		selfDriveVehicles: "Self-drive vehicles",
		news: "News",
		contact: "Contact",
		availability: "Check availability",
		viewFleet: "View selection",
		exploreFleet: "Explore our fleet",
		whatsapp: "WhatsApp",
		menu: "Open menu",
		close: "Close menu",
		language: "Change language",
		passengers: "Guests",
		cabins: "Cabins",
		length: "Length",
		bathrooms: "Bathrooms",
		from: "From",
		noPrices: "Availability and tailored proposal by WhatsApp",
		loaderStatusDefault: "Preparing your private nautical experience",
		loaderStatusFastBoats: "Preparing fast boats",
		loaderStatusYachtsXl: "Preparing XL yachts",
		loaderMastheadEyebrow: "Private nautical service",
		errorEyebrow: "We could not find this",
		errorTitle: "Looks like what you were looking for is not available.",
		errorDescription:
			"The link may have changed or the listing may no longer be published. You can keep browsing from here.",
		errorQuestion: "What would you like to do now?",
		errorNote:
			"If you were looking for a specific booking, we can help on WhatsApp.",
		errorHome: "Go home",
		errorBoats: "View available boats",
		errorWhatsApp: "Message us on WhatsApp",
		errorActionsAriaLabel: "Options to continue",
		footerTagline:
			"Ibiza lifestyle management for sea, mobility and experiences.",
		footerAdmin: "Admin",
		ariaPrimaryNavigation: "Primary navigation",
		ariaBoatCollections: "Boat collections",
		ariaHome: "FastServices – Home",
		galleryOpenFullscreen: "Open {{title}} {{index}} in fullscreen",
		galleryControlsAriaLabel: "Gallery controls",
		galleryPreviousImage: "Previous image",
		galleryNextImage: "Next image",
		galleryCloseImage: "Close image",
		galleryAvailableImages: "Available images",
		galleryViewImage: "View image {{index}}",
		megaMenuRentInIbiza: "Rent {{label}} in Ibiza",
		homeHeroTitle: "Ibiza Lifestyle Management",
		homeFinalCtaEyebrow: "FastServices",
		homeFinalCtaTitle: "Tell us what you want to experience in Ibiza",
		homeFinalCtaDescription:
			"We reply with real availability and a tailored proposal.",
		homeMetadataDescription:
			"Boats, private transfers and water toys coordinated from a single conversation",
		blogMetadataDescription:
			"News, updates and tips to enjoy Ibiza and Formentera from the sea.",
		contactGreeting: "Hello, I would like advice for an Ibiza experience.",
		detailBook: "Book Now",
		detailDescription: "Description",
		detailEquipment: "Equipment",
		detailGallery: "Gallery",
		detailVideo: "Video",
		detailRelatedPrefix: "Other",
		detailRelatedSuffix: "for charter",
		detailHome: "Home",
		detailTransfer: "Private transfer",
		detailWaterToy: "Water toy",
		transfersFleetEyebrow: "Discover our fleet",
		transfersFleetTitle:
			"Chauffeur vehicles for every moment you need in the Balearic Islands",
		transfersStaffNote:
			"All staff are properly uniformed, neat, and hold valid driving licences.",
		transfersDocNote: "All vehicles have up-to-date documentation.",
		securityPersonnelTitle: "Qualified Personnel with TIP cards",
		securityPersonnelDescription:
			"All staff are properly uniformed, clean, and equipped with their respective security gear.\nAll TIPs (professional identification cards) will be valid and verified.",
		boatCollectionHeroTitlePrefix: "Explore our ",
		boatCollectionHeroTitleSuffix: " collection",
	},
	de: {
		services: "Services",
		boats: "Yachten mieten",
		mobileBoatsTab: "Yachten mieten",
		mobilePagesTab: "Services",
		transfers: "Privattransfer",
		waterToys: "Wasserspielzeug",
		security: "Sicherheit",
		selfDriveVehicles: "Mietwagen ohne Fahrer",
		news: "News",
		contact: "Kontakt",
		availability: "Verfügbarkeit anfragen",
		viewFleet: "Auswahl ansehen",
		exploreFleet: "Flotte entdecken",
		whatsapp: "WhatsApp",
		menu: "Menü öffnen",
		close: "Menü schließen",
		language: "Sprache wechseln",
		passengers: "Gäste",
		cabins: "Kabinen",
		length: "Länge",
		bathrooms: "Bäder",
		from: "Ab",
		noPrices: "Verfügbarkeit und Angebot nach Maß per WhatsApp",
		loaderStatusDefault: "Wir bereiten dein privates Nautik-Erlebnis vor",
		loaderStatusFastBoats: "Wir bereiten Schnellboote vor",
		loaderStatusYachtsXl: "Wir bereiten XL-Yachten vor",
		loaderMastheadEyebrow: "Privater Nautik-Service",
		errorEyebrow: "Wir konnten das nicht finden",
		errorTitle: "Das sieht so aus, als wäre das Gesuchte nicht verfügbar.",
		errorDescription:
			"Der Link hat sich möglicherweise geändert oder der Eintrag wird nicht mehr veröffentlicht. Du kannst von hier aus weiter surfen.",
		errorQuestion: "Was möchtest du jetzt tun?",
		errorNote:
			"Wenn du eine konkrete Buchung suchst, helfen wir dir gerne per WhatsApp.",
		errorHome: "Zur Startseite",
		errorBoats: "Verfügbare Boote ansehen",
		errorWhatsApp: "Per WhatsApp schreiben",
		errorActionsAriaLabel: "Optionen zum Fortfahren",
		footerTagline:
			"Ibiza Lifestyle Management für Meer, Mobilität und Erlebnisse.",
		footerAdmin: "Admin",
		ariaPrimaryNavigation: "Hauptnavigation",
		ariaBoatCollections: "Bootskollektionen",
		ariaHome: "FastServices – Startseite",
		galleryOpenFullscreen: "{{title}} {{index}} im Vollbild öffnen",
		galleryControlsAriaLabel: "Galerie-Steuerung",
		galleryPreviousImage: "Vorheriges Bild",
		galleryNextImage: "Nächstes Bild",
		galleryCloseImage: "Bild schließen",
		galleryAvailableImages: "Verfügbare Bilder",
		galleryViewImage: "Bild {{index}} ansehen",
		megaMenuRentInIbiza: "{{label}} auf Ibiza mieten",
		homeHeroTitle: "Ibiza Lifestyle Management",
		homeFinalCtaEyebrow: "FastServices",
		homeFinalCtaTitle: "Sag uns, was du auf Ibiza erleben möchtest",
		homeFinalCtaDescription:
			"Wir antworten mit echter Verfügbarkeit und einem maßgeschneiderten Angebot.",
		homeMetadataDescription:
			"Boote, Privattransfers und Wasserspielzeug – alles aus einem einzigen Gespräch",
		blogMetadataDescription:
			"Neuigkeiten, Updates und Tipps, um Ibiza und Formentera vom Meer aus zu erleben.",
		contactGreeting: "Hallo, ich möchte Beratung für ein Erlebnis auf Ibiza.",
		detailBook: "Jetzt buchen",
		detailDescription: "Beschreibung",
		detailEquipment: "Ausstattung",
		detailGallery: "Galerie",
		detailVideo: "Video",
		detailRelatedPrefix: "Weitere",
		detailRelatedSuffix: "zum Mieten",
		detailHome: "Startseite",
		detailTransfer: "Privattransfer",
		detailWaterToy: "Wasserspielzeug",
		transfersFleetEyebrow: "Entdecke unsere Flotte",
		transfersFleetTitle:
			"Fahrzeuge mit Chauffeur für jeden Moment, den du auf den Balearen brauchst",
		transfersStaffNote:
			"Das gesamte Personal ist ordnungsgemäß uniformiert, gepflegt und im Besitz gültiger Führerscheine.",
		transfersDocNote: "Alle Fahrzeuge verfügen über aktuelle Unterlagen.",
		securityPersonnelTitle: "Qualifiziertes Personal mit TIP-Karten",
		securityPersonnelDescription:
			"Das gesamte Personal ist ordnungsgemäß uniformiert, gepflegt und mit der jeweiligen Sicherheitsausrüstung ausgestattet.\nAlle TIP-Karten (berufliche Identifikationskarten) sind gültig und überprüft.",
		boatCollectionHeroTitlePrefix: "Entdecke unsere ",
		boatCollectionHeroTitleSuffix: " Kollektion",
	},
	nl: {
		services: "Services",
		boats: "Jachten huren",
		mobileBoatsTab: "Jachten huren",
		mobilePagesTab: "Services",
		transfers: "Privétransfers",
		waterToys: "Waterspeelgoed",
		security: "Beveiliging",
		selfDriveVehicles: "Auto zonder chauffeur",
		news: "Nieuws",
		contact: "Contact",
		availability: "Beschikbaarheid aanvragen",
		viewFleet: "Selectie bekijken",
		exploreFleet: "Vloot bekijken",
		whatsapp: "WhatsApp",
		menu: "Menu openen",
		close: "Menu sluiten",
		language: "Taal wijzigen",
		passengers: "Gasten",
		cabins: "Cabines",
		length: "Lengte",
		bathrooms: "Badkamers",
		from: "Vanaf",
		noPrices: "Beschikbaarheid en voorstel op maat via WhatsApp",
		loaderStatusDefault: "We bereiden je privé nautische ervaring voor",
		loaderStatusFastBoats: "We bereiden snelle boten voor",
		loaderStatusYachtsXl: "We bereiden XL-jachten voor",
		loaderMastheadEyebrow: "Privé nautische service",
		errorEyebrow: "We konden dit niet vinden",
		errorTitle: "Het lijkt erop dat wat je zocht niet beschikbaar is.",
		errorDescription:
			"De link is misschien gewijzigd of de pagina wordt niet meer gepubliceerd. Je kunt vanaf hier verder bladeren.",
		errorQuestion: "Wat wil je nu doen?",
		errorNote:
			"Als je een specifieke boeking zocht, helpen we je graag via WhatsApp.",
		errorHome: "Naar home",
		errorBoats: "Beschikbare boten bekijken",
		errorWhatsApp: "Schrijf ons via WhatsApp",
		errorActionsAriaLabel: "Opties om verder te gaan",
		footerTagline:
			"Ibiza lifestyle management voor zee, mobiliteit en ervaringen.",
		footerAdmin: "Admin",
		ariaPrimaryNavigation: "Hoofdnavigatie",
		ariaBoatCollections: "Bootcollecties",
		ariaHome: "FastServices – Home",
		galleryOpenFullscreen: "Open {{title}} {{index}} op volledig scherm",
		galleryControlsAriaLabel: "Galerijbediening",
		galleryPreviousImage: "Vorige afbeelding",
		galleryNextImage: "Volgende afbeelding",
		galleryCloseImage: "Afbeelding sluiten",
		galleryAvailableImages: "Beschikbare afbeeldingen",
		galleryViewImage: "Bekijk afbeelding {{index}}",
		megaMenuRentInIbiza: "Huur {{label}} op Ibiza",
		homeHeroTitle: "Ibiza Lifestyle Management",
		homeFinalCtaEyebrow: "FastServices",
		homeFinalCtaTitle: "Vertel ons wat je wilt beleven op Ibiza",
		homeFinalCtaDescription:
			"We reageren met echte beschikbaarheid en een voorstel op maat.",
		homeMetadataDescription:
			"Boten, privétransfers en waterspeelgoed geregeld vanuit één enkel gesprek",
		blogMetadataDescription:
			"Nieuws, updates en tips om Ibiza en Formentera vanaf zee te beleven.",
		contactGreeting: "Hallo, ik wil graag advies voor een ervaring op Ibiza.",
		detailBook: "Nu boeken",
		detailDescription: "Omschrijving",
		detailEquipment: "Uitrusting",
		detailGallery: "Galerij",
		detailVideo: "Video",
		detailRelatedPrefix: "Andere",
		detailRelatedSuffix: "te huur",
		detailHome: "Home",
		detailTransfer: "Privétransfer",
		detailWaterToy: "Waterspeelgoed",
		transfersFleetEyebrow: "Ontdek onze vloot",
		transfersFleetTitle:
			"Voertuigen met chauffeur voor elk moment dat je nodig hebt op de Balearen",
		transfersStaffNote:
			"Al het personeel is correct geuniformeerd, verzorgd en in het bezit van geldige rijbewijzen.",
		transfersDocNote: "Alle voertuigen hebben actuele documentatie.",
		securityPersonnelTitle: "Gekwalificeerd personeel met TIP-kaarten",
		securityPersonnelDescription:
			"Al het personeel is correct geuniformeerd, verzorgd en uitgerust met de benodigde beveiligingsuitrusting.\nAlle TIP-kaarten (beroepsidentificatiekaarten) zijn geldig en gecontroleerd.",
		boatCollectionHeroTitlePrefix: "Ontdek onze ",
		boatCollectionHeroTitleSuffix: " collectie",
	},
	ru: {
		services: "Услуги",
		boats: "Аренда яхт",
		mobileBoatsTab: "Аренда яхт",
		mobilePagesTab: "Услуги",
		transfers: "Частный трансфер",
		waterToys: "Водные игрушки",
		security: "Безопасность",
		selfDriveVehicles: "Автомобили без водителя",
		news: "Новости",
		contact: "Контакты",
		availability: "Узнать о доступности",
		viewFleet: "Смотреть подборку",
		exploreFleet: "Исследуйте наш флот",
		whatsapp: "WhatsApp",
		menu: "Открыть меню",
		close: "Закрыть меню",
		language: "Сменить язык",
		passengers: "Гостей",
		cabins: "Каюты",
		length: "Длина",
		bathrooms: "Ванные комнаты",
		from: "От",
		noPrices: "Доступность и индивидуальное предложение по WhatsApp",
		loaderStatusDefault: "Готовим ваш частный морской опыт",
		loaderStatusFastBoats: "Готовим быстроходные катера",
		loaderStatusYachtsXl: "Готовим яхты XL",
		loaderMastheadEyebrow: "Частный морской сервис",
		errorEyebrow: "Мы не нашли это",
		errorTitle: "Похоже, то, что вы искали, недоступно.",
		errorDescription:
			"Возможно, ссылка изменилась или страница больше не опубликована. Вы можете продолжить просмотр отсюда.",
		errorQuestion: "Что вы хотите сделать сейчас?",
		errorNote:
			"Если вы искали конкретное бронирование, мы можем помочь через WhatsApp.",
		errorHome: "На главную",
		errorBoats: "Посмотреть доступные яхты",
		errorWhatsApp: "Написать в WhatsApp",
		errorActionsAriaLabel: "Варианты продолжения",
		footerTagline:
			"Ibiza lifestyle management: море, мобильность и впечатления.",
		footerAdmin: "Админ",
		ariaPrimaryNavigation: "Главная навигация",
		ariaBoatCollections: "Коллекции яхт",
		ariaHome: "FastServices – Главная",
		galleryOpenFullscreen: "Открыть {{title}} {{index}} на весь экран",
		galleryControlsAriaLabel: "Управление галереей",
		galleryPreviousImage: "Предыдущее изображение",
		galleryNextImage: "Следующее изображение",
		galleryCloseImage: "Закрыть изображение",
		galleryAvailableImages: "Доступные изображения",
		galleryViewImage: "Посмотреть изображение {{index}}",
		megaMenuRentInIbiza: "Аренда {{label}} на Ибице",
		homeHeroTitle: "Ibiza Lifestyle Management",
		homeFinalCtaEyebrow: "FastServices",
		homeFinalCtaTitle: "Расскажите, какой опыт вы хотите получить на Ибице",
		homeFinalCtaDescription:
			"Мы ответим с реальной доступностью и персональным предложением.",
		homeMetadataDescription:
			"Аренда яхт, частных трансферов и водных развлечений — всё из одного разговора",
		blogMetadataDescription:
			"Новости, обновления и советы, чтобы насладиться Ибицей и Форментерой с моря.",
		contactGreeting:
			"Здравствуйте, я хотел бы получить консультацию по поводу отдыха на Ибице.",
		detailBook: "Забронировать",
		detailDescription: "Описание",
		detailEquipment: "Оборудование",
		detailGallery: "Галерея",
		detailVideo: "Видео",
		detailRelatedPrefix: "Другие",
		detailRelatedSuffix: "в аренду",
		detailHome: "Главная",
		detailTransfer: "Частный трансфер",
		detailWaterToy: "Водная игрушка",
		transfersFleetEyebrow: "Исследуйте наш флот",
		transfersFleetTitle:
			"Автомобили с водителем для любого момента на Балеарских островах",
		transfersStaffNote:
			"Весь персонал в форменной одежде, опрятен и имеет действующие водительские права.",
		transfersDocNote: "У всех автомобилей действующая документация.",
		securityPersonnelTitle: "Квалифицированный персонал с картами TIP",
		securityPersonnelDescription:
			"Весь персонал в форменной одежде, опрятен и оснащён необходимым средствами безопасности.\nВсе карты TIP (профессиональные удостоверения) действительны и проверены.",
		boatCollectionHeroTitlePrefix: "Исследуйте нашу коллекцию ",
		boatCollectionHeroTitleSuffix: "",
	},
} satisfies Record<Locale, Record<string, string>>;
