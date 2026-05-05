import Link from "next/link";
import { MediaImage } from "@/components/MediaImage";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { WaterToyCard } from "@/components/water-toys/WaterToyCard";
import { getLocalizedSlug, getLocalizedValue, type Locale } from "@/lib/i18n";
import type { BoatCollection, ServicePage, Vehicle, WaterToy } from "@/types/content";

interface HomeSectionsProps {
  locale: Locale;
}

export function HomeHero({ locale }: HomeSectionsProps) {
  const heroPoster = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85";

  return (
    <section className="hero-section">
      <div className="hero-section__media">
        <video className="hero-section__video" autoPlay muted loop playsInline preload="metadata" poster={heroPoster} aria-hidden="true">
          <source src="/videos/ibiza-boats-header.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-section__overlay" />
      <div className="container hero-section__content">
        <p className="eyebrow">FastServices</p>
        <h1>Ibiza Lifestyle Management</h1>
        <p>
          {locale === "es"
            ? "Barcos, transfers privados y juguetes náuticos coordinados desde una sola conversación."
            : "Boats, private transfers and water toys coordinated from one conversation."}
        </p>
        <WhatsAppCta locale={locale} variant="light" />
      </div>
    </section>
  );
}

export function BoatCollectionSection({ collections, locale }: HomeSectionsProps & { collections: BoatCollection[] }) {
  return (
    <section className="section" id="alquiler-barcos">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">1. {locale === "es" ? "Alquiler de barcos" : "Boat rentals"}</p>
          <h2>{locale === "es" ? "Selecciona tu experiencia en el mar" : "Choose your sea experience"}</h2>
          <p>
            {locale === "es"
              ? "Tres colecciones privadas con acceso rápido a disponibilidad por WhatsApp."
              : "Three private collections with quick WhatsApp availability checks."}
          </p>
        </div>
        <div className="content-grid content-grid--three service-card-grid">
          {collections.map((collection) => (
            <Link href={`/${locale}/${getLocalizedSlug(collection.slugsByLocale, locale)}`} className="service-card" key={collection.id}>
              <span className="service-card__tag">{getLocalizedValue(collection.title, locale)}</span>
              <span className="service-card__image">
                <MediaImage asset={collection.image} locale={locale} sizes="(max-width: 768px) 100vw, 33vw" />
              </span>
              <span className="service-card__body">
                <strong>{getLocalizedValue(collection.description, locale)}</strong>
                <small>{getLocalizedValue(collection.selectionNote, locale)}</small>
                <span className="text-link">{locale === "es" ? "Consultar selección" : "View selection"}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TransferSection({ locale, servicePages, vehicles }: HomeSectionsProps & { servicePages: ServicePage[]; vehicles: Vehicle[] }) {
  const transferSectionSlug = getLocalizedSlug(servicePages.find((page) => page.serviceId === "transfers")?.slugsByLocale ?? { es: "transfer", en: "transfers" }, locale);

  return (
    <section className="section section--soft">
      <div className="container">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">2. {locale === "es" ? "Servicios transfer privado" : "Private transfer services"}</p>
          <h2>{locale === "es" ? "Soluciones de transporte privado para cubrir cualquier necesidad" : "Private transport solutions for every need"}</h2>
          <p>
            {locale === "es"
              ? "Chóferes profesionales, vehículos premium y coordinación para aeropuerto, villas, marinas, eventos y beach clubs."
              : "Professional chauffeurs, premium vehicles and coordination for airport, villas, marinas, events and beach clubs."}
          </p>
        </div>
        <div className="content-grid content-grid--three">
          {vehicles.map((vehicle) => (
            <VehicleCard vehicle={vehicle} locale={locale} sectionSlug={transferSectionSlug} key={vehicle.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function WaterToysSection({ locale, servicePages, waterToys }: HomeSectionsProps & { servicePages: ServicePage[]; waterToys: WaterToy[] }) {
  const waterToysSectionSlug = getLocalizedSlug(servicePages.find((page) => page.serviceId === "water-toys")?.slugsByLocale ?? { es: "juguetes-nauticos", en: "water-toys" }, locale);

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">3. {locale === "es" ? "Juguetes náuticos" : "Water toys"}</p>
          <h2>{locale === "es" ? "Añade diversión a tu reserva" : "Add fun to your booking"}</h2>
          <p>
            {locale === "es"
              ? "Sin precios publicados: te orientamos por WhatsApp para que el equipo cierre disponibilidad y logística por teléfono."
              : "No published prices: we guide you by WhatsApp so the team can close availability and logistics by phone."}
          </p>
        </div>
        <div className="content-grid content-grid--three">
          {waterToys.map((toy) => (
            <WaterToyCard toy={toy} locale={locale} sectionSlug={waterToysSectionSlug} key={toy.id} />
          ))}
        </div>
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