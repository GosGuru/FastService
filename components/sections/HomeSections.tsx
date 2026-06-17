import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { BoatCard } from "@/components/boats/BoatCard";
import { MediaImage } from "@/components/MediaImage";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { HomeCardRail } from "@/components/sections/HomeCardRail";
import { HomeHeroExperience } from "@/components/sections/HomeHeroExperience";
import { ServiceOptionCard } from "@/components/services/ServiceOptionCard";
import { NoWidowAccent, NoWidowText } from "@/components/typography/NoWidowText";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { WaterToyCard } from "@/components/water-toys/WaterToyCard";
import { getLocalizedSlug, getLocalizedValue, type Locale } from "@/lib/i18n";
import type { Boat, BoatCollection, BoatCollectionId, ServicePage, Vehicle, WaterToy } from "@/types/content";

interface HomeSectionsProps {
  locale: Locale;
}

export function HomeHero({ locale }: HomeSectionsProps) {
  return <HomeHeroExperience locale={locale} />;
}

const homeIntroCopy: Record<Locale, { eyebrow: string; title: string; italic: string; first: string; second: string; third?: string; fourth?: string; cta: string; message: string }> = {
  es: {
    eyebrow: "FastServices Ibiza",
    title: "Alquiler de yates",
    italic: "Ibiza",
    first: "¿No sabes qué barco elegir? Nosotros te asesoramos.",
    second: "Accede a una selección exclusiva de yates, lanchas y catamaranes en Ibiza, Formentera y Mallorca.",
    third: "Comparamos opciones, resolvemos tus dudas y organizamos toda la experiencia para que reserves con total confianza, de forma rápida y sin complicaciones.",
    fourth: "Contacta ahora y recibe recomendaciones personalizadas para tu día perfecto en el mar.",
    cta: "Contacta ahora",
    message: "Hola, quiero recibir recomendaciones personalizadas para mi día perfecto en el mar."
  },
  en: {
    eyebrow: "FastServices Ibiza",
    title: "Yacht rental",
    italic: "Ibiza",
    first: "Enjoy a private day at sea with a curated selection of yachts, mega yachts and fast boats for Ibiza and Formentera.",
    second: "If it is your first time booking, I guide you from the idea to confirmation: the right boat, route, timing, extras and clear WhatsApp coordination.",
    cta: "Get in touch",
    message: "Hello, I would like help choosing a boat experience in Ibiza."
  },
  de: {
    eyebrow: "FastServices Ibiza",
    title: "Yachtcharter",
    italic: "Ibiza",
    first: "Erlebe einen privaten Tag auf dem Meer mit ausgewählten Yachten, Megayachten und Schnellbooten für Ibiza und Formentera.",
    second: "Wenn du zum ersten Mal buchst, begleite ich dich von der Idee bis zur Bestätigung: passendes Boot, Route, Zeiten, Extras und klare Abstimmung per WhatsApp.",
    cta: "Kontakt aufnehmen",
    message: "Hallo, ich möchte Hilfe bei der Auswahl eines Bootserlebnisses auf Ibiza."
  },
  nl: {
    eyebrow: "FastServices Ibiza",
    title: "Jachtverhuur",
    italic: "Ibiza",
    first: "Beleef een privédag op zee met een zorgvuldig gekozen selectie jachten, megajachten en snelle boten voor Ibiza en Formentera.",
    second: "Boek je voor het eerst, dan begeleid ik je van idee tot bevestiging: de juiste boot, route, timing, extra's en duidelijke WhatsApp-coördinatie.",
    cta: "Neem contact op",
    message: "Hallo, ik wil graag hulp bij het kiezen van een bootervaring op Ibiza."
  },
  ru: {
    eyebrow: "FastServices Ibiza",
    title: "Аренда яхт",
    italic: "Ibiza",
    first: "Наслаждайтесь частным днем на море с тщательно подобранной коллекцией яхт, мегаяхт и катеров для Ибицы и Форментеры.",
    second: "Если вы бронируете впервые, я проведу вас от идеи до подтверждения: правильная яхта, маршрут, время, дополнения и четкая координация через WhatsApp.",
    cta: "Связаться",
    message: "Здравствуйте, я хотел бы получить помощь в выборе морского приключения на Ибице."
  }
};

const collectionCopy: Record<BoatCollectionId, Record<Locale, { title: string; body: string }>> = {
  "yachts-xl": {
    es: { title: "Alquiler de megayates en Ibiza", body: "Lujo, privacidad y tripulación para jornadas especiales, eventos o una experiencia premium sin improvisar." },
    en: { title: "Mega yacht rental in Ibiza", body: "Luxury, privacy and crew for special days, events or a premium experience without guesswork." },
    de: { title: "Megayachten auf Ibiza mieten", body: "Luxus, Privatsphäre und Crew für besondere Tage, Events oder ein Premium-Erlebnis ohne Improvisation." },
    nl: { title: "Megajachten huren op Ibiza", body: "Luxe, privacy en bemanning voor bijzondere dagen, events of een premium ervaring zonder improvisatie." },
    ru: { title: "Аренда мегаяхт на Ибице", body: "Роскошь, приватность и команда для особых дней, мероприятий или премиального опыта без импровизации." }
  },
  yachts: {
    es: { title: "Alquiler de yates en Ibiza", body: "Elige entre yates cómodos y elegantes para disfrutar calas, Formentera y un día completo a tu ritmo." },
    en: { title: "Yacht rental in Ibiza", body: "Choose comfortable, elegant yachts for coves, Formentera and a full day shaped around your pace." },
    de: { title: "Yachten auf Ibiza mieten", body: "Wähle komfortable, elegante Yachten für Buchten, Formentera und einen ganzen Tag nach deinem Rhythmus." },
    nl: { title: "Jachten huren op Ibiza", body: "Kies comfortabele, elegante jachten voor baaien, Formentera en een volledige dag op jouw tempo." },
    ru: { title: "Аренда яхт на Ибице", body: "Выбирайте комфортабельные, элегантные яхты для бухт, Форментеры и полного дня в вашем ритме." }
  },
  "fast-boats": {
    es: { title: "Alquiler de lanchas rápidas en Ibiza", body: "Una opción ágil para calas, rutas cortas y planes con más movimiento entre Ibiza y Formentera." },
    en: { title: "Fast boat rental in Ibiza", body: "An agile option for coves, shorter routes and more dynamic plans between Ibiza and Formentera." },
    de: { title: "Schnellboote auf Ibiza mieten", body: "Eine agile Option für Buchten, kürzere Routen und dynamische Pläne zwischen Ibiza und Formentera." },
    nl: { title: "Snelle boten huren op Ibiza", body: "Een wendbare optie voor baaien, kortere routes en dynamische plannen tussen Ibiza en Formentera." },
    ru: { title: "Аренда катеров на Ибице", body: "Маневренный вариант для бухт, коротких маршрутов и динамичных планов между Ибицей и Форментерой." }
  }
};

const featuredBoatIds = ["riva-argo-90", "pershing-90", "cranchi-50", "fjord-41-xl"];

const homeUiCopy: Record<
  Locale,
  {
    nauticalEyebrow: string;
    chooseSail: string;
    ibiza: string;
    nauticalText: string;
    fleet: string;
    book: string;
    mostRequestedEyebrow: string;
    mostRequestedTitle: string;
    mostRequestedItalic: string;
    mostRequestedText: string;
    featuredAria: string;
  }
> = {
  es: {
    nauticalEyebrow: "Experiencias náuticas",
    chooseSail: "Elige tu forma de navegar",
    ibiza: "Ibiza",
    nauticalText: "Bloques claros, selección real y contacto directo para cerrar disponibilidad sin vueltas.",
    fleet: "Nuestra flota",
    book: "Reservar ahora",
    mostRequestedEyebrow: "Lo más solicitado",
    mostRequestedTitle: "Los más solicitados",
    mostRequestedItalic: "Alquiler de Barcos",
    mostRequestedText: "Una selección rápida para entrar, comparar y pedir disponibilidad por WhatsApp con Rodrigo.",
    featuredAria: "Barcos destacados"
  },
  en: {
    nauticalEyebrow: "Nautical experiences",
    chooseSail: "Choose how you want to sail",
    ibiza: "Ibiza",
    nauticalText: "Clear categories, real selection and direct contact to confirm availability without friction.",
    fleet: "Our fleet",
    book: "Book now",
    mostRequestedEyebrow: "Most requested",
    mostRequestedTitle: "Most requested",
    mostRequestedItalic: "Boat Rentals",
    mostRequestedText: "A quick selection to browse, compare and request availability by WhatsApp.",
    featuredAria: "Featured boats"
  },
  de: {
    nauticalEyebrow: "Nautische Erlebnisse",
    chooseSail: "Wähle, wie du fahren möchtest",
    ibiza: "Ibiza",
    nauticalText: "Klare Kategorien, echte Auswahl und direkter Kontakt, um Verfügbarkeit unkompliziert zu bestätigen.",
    fleet: "Unsere Flotte",
    book: "Jetzt reservieren",
    mostRequestedEyebrow: "Am meisten angefragt",
    mostRequestedTitle: "Am meisten angefragt",
    mostRequestedItalic: "Bootsvermietung",
    mostRequestedText: "Eine schnelle Auswahl zum Entdecken, Vergleichen und Anfragen per WhatsApp.",
    featuredAria: "Ausgewählte Boote"
  },
  nl: {
    nauticalEyebrow: "Nautische ervaringen",
    chooseSail: "Kies hoe je wilt varen",
    ibiza: "Ibiza",
    nauticalText: "Duidelijke categorieën, echte selectie en direct contact om beschikbaarheid zonder gedoe te bevestigen.",
    fleet: "Onze vloot",
    book: "Nu reserveren",
    mostRequestedEyebrow: "Meest gevraagd",
    mostRequestedTitle: "Meest gevraagd",
    mostRequestedItalic: "Bootverhuur",
    mostRequestedText: "Een snelle selectie om te bekijken, vergelijken en beschikbaarheid via WhatsApp aan te vragen.",
    featuredAria: "Uitgelichte boten"
  }
};

export function HomeIntroSection({ locale }: HomeSectionsProps) {
  const copy = homeIntroCopy[locale];

  return (
    <section className="home-intro" id="experiencias-ibiza">
      <div className="container home-intro__inner">
        <div className="home-intro__headline">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>
            <NoWidowAccent text={copy.title} accent={copy.italic} />
          </h2>
        </div>
        <div className="home-intro__copy">
          <p>{copy.first}</p>
          <p>{copy.second}</p>
          {copy.third ? <p>{copy.third}</p> : null}
          {copy.fourth ? <p>{copy.fourth}</p> : null}
          <WhatsAppCta locale={locale} label={copy.cta} message={copy.message} />
        </div>
      </div>
    </section>
  );
}

export function BoatCollectionSection({ collections, locale }: HomeSectionsProps & { collections: BoatCollection[] }) {
  const copy = homeUiCopy[locale];

  return (
    <section className="home-boat-experiences section" id="alquiler-barcos">
      <div className="container">
        <div className="section-heading section-heading--center home-section-heading">
          <p className="eyebrow">{copy.nauticalEyebrow}</p>
          <h2>
            <NoWidowAccent text={copy.chooseSail} accent={copy.ibiza} />
          </h2>
          <p>{copy.nauticalText}</p>
        </div>

        <div className="home-collection-stack">
          {collections.map((collection, index) => {
            const localizedCopy = collectionCopy[collection.collectionId][locale];
            const href = `/${locale}/${getLocalizedSlug(collection.slugsByLocale, locale)}`;

            return (
              <article className={`home-collection-panel ${index % 2 ? "home-collection-panel--reverse" : ""}`} key={collection.id}>
                <div className="home-collection-panel__content">
                  <p>{getLocalizedValue(collection.title, locale)}</p>
                  <h3>
                    <NoWidowText text={localizedCopy.title} />
                  </h3>
                  <span>{localizedCopy.body}</span>
                  <div className="home-collection-panel__actions">
                    <Link href={href} className="home-collection-panel__primary">
                      <span>{copy.fleet}</span>
                      <FiArrowRight aria-hidden="true" />
                    </Link>
                    <WhatsAppCta
                      locale={locale}
                      label={copy.book}
                      message={getLocalizedValue(collection.whatsappMessage, locale)}
                      variant="outline"
                      className="home-collection-panel__contact"
                    />
                  </div>
                </div>
                <Link href={href} className="home-collection-panel__image" aria-label={localizedCopy.title}>
                  <MediaImage asset={collection.image} locale={locale} sizes="(max-width: 900px) 100vw, 54vw" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FeaturedBoatsSection({ boats, locale }: HomeSectionsProps & { boats: Boat[] }) {
  const copy = homeUiCopy[locale];
  const featuredBoats: Boat[] = [];
  const boatsById = new Map(boats.map((boat) => [boat.id, boat]));

  for (const id of featuredBoatIds) {
    const boat = boatsById.get(id);
    if (boat) featuredBoats.push(boat);
  }

  const displayBoats = featuredBoats.length ? featuredBoats : boats.slice(0, 4);

  if (!displayBoats.length) return null;

  return (
    <section className="home-featured-boats section" id="barcos-destacados">
      <div className="container">
        <div className="section-heading section-heading--center home-section-heading">
          <p className="eyebrow">{copy.mostRequestedEyebrow}</p>
          <h2>
            {copy.mostRequestedTitle} <span>{copy.mostRequestedItalic}</span>
          </h2>
          <p>{copy.mostRequestedText}</p>
        </div>

        <div className="home-featured-boats__rail" aria-label={copy.featuredAria}>
          {displayBoats.map((boat) => (
            <BoatCard boat={boat} locale={locale} key={boat.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TransferSection({ locale, servicePages, vehicles }: HomeSectionsProps & { servicePages: ServicePage[]; vehicles: Vehicle[] }) {
  const transferPage = servicePages.find((page) => page.serviceId === "transfers");
  const transferSectionSlug = getLocalizedSlug(transferPage?.slugsByLocale ?? { es: "transfer", en: "transfers" }, locale);
  const eyebrow = transferPage ? getLocalizedValue(transferPage.eyebrow, locale) : locale === "es" ? "Servicios transfer privado" : "Private transfer services";
  const title = transferPage ? getLocalizedValue(transferPage.title, locale) : locale === "es" ? "Soluciones de transporte privado para cubrir cualquier necesidad" : "Private transport solutions for every need";
  const description = transferPage
    ? getLocalizedValue(transferPage.description, locale)
    : locale === "es"
      ? "Chóferes profesionales, vehículos premium y coordinación para aeropuerto, villas, marinas, eventos y beach clubs."
      : "Professional chauffeurs, premium vehicles and coordination for airport, villas, marinas, events and beach clubs.";

  return (
    <section className="section section--soft">
      <div className="container">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">2. {eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <HomeCardRail>
          {vehicles.map((vehicle) => (
            <VehicleCard vehicle={vehicle} locale={locale} sectionSlug={transferSectionSlug} key={vehicle.id} />
          ))}
        </HomeCardRail>
      </div>
    </section>
  );
}

export function WaterToysSection({ locale, servicePages, waterToys }: HomeSectionsProps & { servicePages: ServicePage[]; waterToys: WaterToy[] }) {
  const waterToysPage = servicePages.find((page) => page.serviceId === "water-toys");
  const waterToysSectionSlug = getLocalizedSlug(waterToysPage?.slugsByLocale ?? { es: "juguetes-nauticos", en: "water-toys" }, locale);
  const eyebrow = waterToysPage ? getLocalizedValue(waterToysPage.eyebrow, locale) : locale === "es" ? "Juguetes náuticos" : "Water toys";
  const title = waterToysPage ? getLocalizedValue(waterToysPage.title, locale) : locale === "es" ? "Añade diversión a tu reserva" : "Add fun to your booking";
  const description = waterToysPage
    ? getLocalizedValue(waterToysPage.description, locale)
    : locale === "es"
      ? "Sin precios publicados: te orientamos por WhatsApp para que el equipo cierre disponibilidad y logística por teléfono."
      : "No published prices: we guide you by WhatsApp so the team can close availability and logistics by phone.";

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">3. {eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <HomeCardRail>
          {waterToys.map((toy) => (
            <WaterToyCard toy={toy} locale={locale} sectionSlug={waterToysSectionSlug} key={toy.id} />
          ))}
        </HomeCardRail>
      </div>
    </section>
  );
}

function getServicePage(servicePages: ServicePage[], serviceId: string) {
  return servicePages.find((page) => page.serviceId === serviceId);
}

export function SecuritySection({ locale, servicePages }: HomeSectionsProps & { servicePages: ServicePage[] }) {
  const securityPage = getServicePage(servicePages, "security");
  const securitySlug = getLocalizedSlug(securityPage?.slugsByLocale ?? { es: "seguridad", en: "security" }, locale);
  const securityOptions = securityPage?.options ?? [];
  const title = securityPage ? getLocalizedValue(securityPage.title, locale) : locale === "es" ? "Seguridad privada, escolta y acompañamiento" : "Private security, escort and accompaniment";
  const eyebrow = securityPage ? getLocalizedValue(securityPage.eyebrow, locale) : locale === "es" ? "Seguridad" : "Security";
  const description = securityPage
    ? getLocalizedValue(securityPage.description, locale)
    : locale === "es"
      ? "Protección de bienes en villas, escolta diurna y cobertura nocturna o clubbing coordinada de forma discreta."
      : "Asset protection for villas, daytime escort and discreet night or clubbing coverage.";

  if (!securityOptions.length) return null;

  return (
    <section className="section section--soft" id="seguridad">
      <div className="container">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">4. {eyebrow}</p>
          <h2>
            <NoWidowText text={title} lockWords={2} />
          </h2>
          <p>
            <NoWidowText text={description} />
          </p>
        </div>
        <HomeCardRail>
          {securityOptions.map((service) => (
            <ServiceOptionCard option={service} locale={locale} detailHref={`/${locale}/${securitySlug}#${service.id}`} key={service.id} />
          ))}
        </HomeCardRail>
      </div>
    </section>
  );
}

export function SelfDriveVehiclesSection({ locale, servicePages }: HomeSectionsProps & { servicePages: ServicePage[] }) {
  const selfDrivePage = getServicePage(servicePages, "self-drive");
  const selfDriveSlug = getLocalizedSlug(selfDrivePage?.slugsByLocale ?? { es: "alquiler-vehiculos-sin-conductor", en: "self-drive-car-rental" }, locale);
  const selfDriveOptions = selfDrivePage?.options ?? [];
  const title = selfDrivePage ? getLocalizedValue(selfDrivePage.title, locale) : locale === "es" ? "Tres opciones para moverte a tu ritmo" : "Three options to move at your own pace";
  const eyebrow = selfDrivePage ? getLocalizedValue(selfDrivePage.eyebrow, locale) : locale === "es" ? "Alquiler vehículos sin conductor" : "Self-drive vehicle rental";
  const description = selfDrivePage
    ? getLocalizedValue(selfDrivePage.description, locale)
    : locale === "es"
      ? "Mismo flujo que juguetes náuticos: sin precios publicados, consulta por WhatsApp y confirmación según fechas, entrega y disponibilidad."
      : "Same flow as water toys: no published prices, WhatsApp request and confirmation based on dates, delivery and availability.";

  if (!selfDriveOptions.length) return null;

  return (
    <section className="section" id="alquiler-vehiculos-sin-conductor">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">5. {eyebrow}</p>
          <h2>
            <NoWidowText text={title} lockWords={2} />
          </h2>
          <p>
            <NoWidowText text={description} lockWords={3} />
          </p>
        </div>
        <HomeCardRail>
          {selfDriveOptions.map((vehicle) => (
            <ServiceOptionCard option={vehicle} locale={locale} detailHref={`/${locale}/${selfDriveSlug}#${vehicle.id}`} key={vehicle.id} />
          ))}
        </HomeCardRail>
      </div>
    </section>
  );
}

export function FinalCta({ locale }: HomeSectionsProps) {
  return (
    <section className="final-cta">
      <div className="container final-cta__inner">
        <div>
          <p className="eyebrow">FastServices</p>
          <h2>{locale === "es" ? "Dinos qué quieres vivir en Ibiza" : "Tell us what you want to experience in Ibiza"}</h2>
          <p>{locale === "es" ? "Te respondemos con disponibilidad real y una propuesta personalizada." : "We reply with real availability and a tailored proposal."}</p>
        </div>
        <WhatsAppCta locale={locale} variant="light" />
      </div>
    </section>
  );
}
