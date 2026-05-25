import type { LocalizedText, MediaAsset } from "@/types/content";

export interface ServiceOption {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  details: LocalizedText;
  image: MediaAsset;
  whatsappMessage: LocalizedText;
}

export const securityServices: ServiceOption[] = [
  {
    id: "villa-assets-security",
    name: {
      es: "Seguridad y protección de bienes en villas",
      en: "Security and asset protection for villas",
      de: "Sicherheit und Objektschutz in Villen",
      nl: "Beveiliging en bescherming van eigendommen in villa's"
    },
    description: {
      es: "Servicio discreto para villas, propiedades privadas y estancias donde la tranquilidad del cliente es prioridad.",
      en: "Discreet service for villas, private properties and stays where client peace of mind comes first.",
      de: "Diskreter Service fuer Villen, private Immobilien und Aufenthalte, bei denen Ruhe und Sicherheit im Mittelpunkt stehen.",
      nl: "Discrete service voor villa's, prive-eigendommen en verblijven waar rust vooropstaat."
    },
    details: {
      es: "Coordinamos personal cualificado según la ubicación, el horario y el nivel de cobertura requerido.",
      en: "We coordinate qualified staff according to location, schedule and required coverage level.",
      de: "Wir koordinieren qualifiziertes Personal je nach Standort, Zeitplan und gewuenschtem Schutzumfang.",
      nl: "We coordineren gekwalificeerd personeel op basis van locatie, planning en gewenste dekking."
    },
    image: {
      src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Villa privada en Ibiza", en: "Private villa in Ibiza", de: "Private Villa auf Ibiza", nl: "Privevilla op Ibiza" },
      source: "unsplash"
    },
    whatsappMessage: {
      es: "Hola, quiero consultar seguridad y protección de bienes en una villa en Ibiza.",
      en: "Hello, I would like to check villa security and asset protection in Ibiza.",
      de: "Hallo, ich moechte Sicherheit und Objektschutz fuer eine Villa auf Ibiza anfragen.",
      nl: "Hallo, ik wil graag beveiliging en bescherming voor een villa op Ibiza aanvragen."
    }
  },
  {
    id: "daytime-escort",
    name: {
      es: "Escolta y acompañamiento diurno",
      en: "Daytime escort and accompaniment",
      de: "Begleitung und Personenschutz tagsueber",
      nl: "Begeleiding en escort overdag"
    },
    description: {
      es: "Acompañamiento profesional para desplazamientos, compras, eventos privados, reuniones o agenda familiar.",
      en: "Professional accompaniment for transfers, shopping, private events, meetings or family schedules.",
      de: "Professionelle Begleitung fuer Fahrten, Shopping, private Events, Termine oder Familienplaene.",
      nl: "Professionele begeleiding voor ritten, shopping, prive-evenementen, afspraken of gezinsplanning."
    },
    details: {
      es: "El servicio se adapta al itinerario del día y se coordina con chóferes, villas, hoteles o beach clubs.",
      en: "The service adapts to the day's itinerary and can be coordinated with chauffeurs, villas, hotels or beach clubs.",
      de: "Der Service passt sich dem Tagesplan an und kann mit Chauffeuren, Villen, Hotels oder Beach Clubs abgestimmt werden.",
      nl: "De service past zich aan de dagplanning aan en kan worden afgestemd met chauffeurs, villa's, hotels of beachclubs."
    },
    image: {
      src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Vehiculo privado circulando de dia", en: "Private vehicle driving during the day", de: "Privatfahrzeug bei Tag", nl: "Privevoertuig overdag" },
      source: "unsplash"
    },
    whatsappMessage: {
      es: "Hola, quiero consultar escolta y acompañamiento diurno en Ibiza.",
      en: "Hello, I would like to check daytime escort and accompaniment in Ibiza.",
      de: "Hallo, ich moechte Begleitung und Personenschutz tagsueber auf Ibiza anfragen.",
      nl: "Hallo, ik wil graag begeleiding overdag op Ibiza aanvragen."
    }
  },
  {
    id: "nightlife-security-escort",
    name: {
      es: "Seguridad y escolta clubbing / nocturno",
      en: "Nightlife security and escort",
      de: "Sicherheit und Begleitung fuer Nachtleben",
      nl: "Beveiliging en begeleiding voor nightlife"
    },
    description: {
      es: "Cobertura discreta para salidas nocturnas, clubs, traslados y regreso seguro a villa u hotel.",
      en: "Discreet coverage for nights out, clubs, transfers and safe return to villa or hotel.",
      de: "Diskrete Betreuung fuer Abende, Clubs, Transfers und die sichere Rueckkehr zur Villa oder zum Hotel.",
      nl: "Discrete dekking voor avonden uit, clubs, transfers en veilige terugkeer naar villa of hotel."
    },
    details: {
      es: "Planificamos el acompañamiento según agenda, accesos, horarios y nivel de discreción requerido.",
      en: "We plan accompaniment around the schedule, access points, timings and required level of discretion.",
      de: "Wir planen die Begleitung nach Ablauf, Zugaengen, Zeiten und gewuenschtem Diskretionsniveau.",
      nl: "We plannen de begeleiding rond agenda, toegangen, tijden en gewenst discretieniveau."
    },
    image: {
      src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Ambiente nocturno en un club", en: "Nightclub atmosphere", de: "Atmosphaere in einem Club bei Nacht", nl: "Nachtclub sfeer" },
      source: "unsplash"
    },
    whatsappMessage: {
      es: "Hola, quiero consultar seguridad y escolta clubbing o nocturno en Ibiza.",
      en: "Hello, I would like to check nightlife security and escort in Ibiza.",
      de: "Hallo, ich moechte Sicherheit und Begleitung fuer das Nachtleben auf Ibiza anfragen.",
      nl: "Hallo, ik wil graag beveiliging en begeleiding voor nightlife op Ibiza aanvragen."
    }
  }
];

export const selfDriveVehicles: ServiceOption[] = [
  {
    id: "self-drive-compact",
    name: {
      es: "Vehículo compacto sin conductor",
      en: "Self-drive compact vehicle",
      de: "Kompaktwagen ohne Fahrer",
      nl: "Compacte auto zonder chauffeur"
    },
    description: {
      es: "Opción ágil para moverse por Ibiza con autonomía y gestión directa por WhatsApp.",
      en: "Agile option for moving around Ibiza with autonomy and direct WhatsApp coordination.",
      de: "Flexible Option, um Ibiza selbststaendig zu erkunden, mit direkter Abstimmung per WhatsApp.",
      nl: "Flexibele optie om zelfstandig door Ibiza te rijden met directe WhatsApp-coordinatie."
    },
    details: {
      es: "Disponibilidad bajo consulta según fechas, punto de entrega y condiciones de alquiler.",
      en: "Availability on request depending on dates, delivery point and rental conditions.",
      de: "Verfuegbarkeit auf Anfrage je nach Datum, Uebergabeort und Mietbedingungen.",
      nl: "Beschikbaarheid op aanvraag, afhankelijk van data, afleverpunt en huurvoorwaarden."
    },
    image: {
      src: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Coche compacto en carretera", en: "Compact car on the road", de: "Kompaktwagen auf der Strasse", nl: "Compacte auto op de weg" },
      source: "unsplash"
    },
    whatsappMessage: {
      es: "Hola, quiero consultar alquiler de vehículo compacto sin conductor en Ibiza.",
      en: "Hello, I would like to check self-drive compact vehicle rental in Ibiza.",
      de: "Hallo, ich moechte einen Kompaktwagen ohne Fahrer auf Ibiza anfragen.",
      nl: "Hallo, ik wil graag een compacte auto zonder chauffeur op Ibiza huren."
    }
  },
  {
    id: "self-drive-suv",
    name: {
      es: "SUV sin conductor",
      en: "Self-drive SUV",
      de: "SUV ohne Fahrer",
      nl: "SUV zonder chauffeur"
    },
    description: {
      es: "Más espacio y comodidad para calas, villas, beach clubs y planes con equipaje.",
      en: "More space and comfort for coves, villas, beach clubs and plans with luggage.",
      de: "Mehr Platz und Komfort fuer Buchten, Villen, Beach Clubs und Plaene mit Gepaeck.",
      nl: "Meer ruimte en comfort voor baaien, villa's, beachclubs en plannen met bagage."
    },
    details: {
      es: "Te confirmamos opciones reales según temporada, disponibilidad y logística de entrega.",
      en: "We confirm real options according to season, availability and delivery logistics.",
      de: "Wir bestaetigen reale Optionen je nach Saison, Verfuegbarkeit und Uebergabelogistik.",
      nl: "We bevestigen echte opties op basis van seizoen, beschikbaarheid en afleverlogistiek."
    },
    image: {
      src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "SUV premium en carretera", en: "Premium SUV on the road", de: "Premium-SUV auf der Strasse", nl: "Premium SUV op de weg" },
      source: "unsplash"
    },
    whatsappMessage: {
      es: "Hola, quiero consultar alquiler de SUV sin conductor en Ibiza.",
      en: "Hello, I would like to check self-drive SUV rental in Ibiza.",
      de: "Hallo, ich moechte einen SUV ohne Fahrer auf Ibiza anfragen.",
      nl: "Hallo, ik wil graag een SUV zonder chauffeur op Ibiza huren."
    }
  },
  {
    id: "self-drive-premium",
    name: {
      es: "Vehículo premium sin conductor",
      en: "Self-drive premium vehicle",
      de: "Premiumfahrzeug ohne Fahrer",
      nl: "Premium auto zonder chauffeur"
    },
    description: {
      es: "Una alternativa mas exclusiva para clientes que quieren moverse por la isla a su ritmo.",
      en: "A more exclusive option for clients who want to move around the island at their own pace.",
      de: "Eine exklusivere Option fuer Kunden, die sich auf der Insel frei bewegen moechten.",
      nl: "Een exclusievere optie voor klanten die het eiland op hun eigen tempo willen verkennen."
    },
    details: {
      es: "La propuesta se confirma por WhatsApp con fechas, depósito, entrega y recogida.",
      en: "The proposal is confirmed by WhatsApp with dates, deposit, delivery and collection.",
      de: "Das Angebot wird per WhatsApp mit Daten, Kaution, Uebergabe und Rueckgabe bestaetigt.",
      nl: "Het voorstel wordt via WhatsApp bevestigd met data, borg, levering en ophalen."
    },
    image: {
      src: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
      alt: { es: "Coche premium en exterior", en: "Premium car outside", de: "Premiumfahrzeug im Aussenbereich", nl: "Premium auto buiten" },
      source: "unsplash"
    },
    whatsappMessage: {
      es: "Hola, quiero consultar alquiler de vehículo premium sin conductor en Ibiza.",
      en: "Hello, I would like to check self-drive premium vehicle rental in Ibiza.",
      de: "Hallo, ich moechte ein Premiumfahrzeug ohne Fahrer auf Ibiza anfragen.",
      nl: "Hallo, ik wil graag een premium auto zonder chauffeur op Ibiza huren."
    }
  }
];
