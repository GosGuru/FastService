import { CardActions } from "@/components/cards/CardActions";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import { NoWidowText } from "@/components/typography/NoWidowText";
import { getVehiclePath } from "@/lib/routes";
import { getLocalizedSlug, getLocalizedValue, type Locale } from "@/lib/i18n";
import type { Vehicle } from "@/types/content";
import { PiUsers, PiBriefcase, PiSparkle, PiDrop, PiCalendar, PiShieldCheck } from "react-icons/pi";

const specIcons = {
  passengers: PiUsers,
  bags: PiBriefcase,
  comfort: PiSparkle,
  water: PiDrop,
  calendar: PiCalendar,
  asientos: PiUsers,
  seats: PiUsers,
  año: PiCalendar,
  year: PiCalendar,
  equipaje: PiBriefcase,
  luggage: PiBriefcase
};

const getSpecIcon = (icon?: string, labelEs?: string) => {
  const cleanLabel = (labelEs || "").toLowerCase().trim();
  if (cleanLabel.includes("asiento") || cleanLabel.includes("pasajero") || cleanLabel.includes("plaza") || cleanLabel.includes("pax")) {
    return PiUsers;
  }
  if (cleanLabel.includes("año") || cleanLabel.includes("fecha") || cleanLabel.includes("year")) {
    return PiCalendar;
  }
  if (cleanLabel.includes("equipaje") || cleanLabel.includes("maleta") || cleanLabel.includes("bolsa") || cleanLabel.includes("bulto") || cleanLabel.includes("luggage") || cleanLabel.includes("bag")) {
    return PiBriefcase;
  }
  if (cleanLabel.includes("confort") || cleanLabel.includes("aire") || cleanLabel.includes("a/c") || cleanLabel.includes("comfort")) {
    return PiSparkle;
  }
  if (cleanLabel.includes("agua") || cleanLabel.includes("bordo") || cleanLabel.includes("bebida") || cleanLabel.includes("water")) {
    return PiDrop;
  }

  if (icon && specIcons[icon as keyof typeof specIcons]) {
    return specIcons[icon as keyof typeof specIcons];
  }
  return PiShieldCheck;
};

interface VehicleCardProps {
  vehicle: Vehicle;
  locale: Locale;
  sectionSlug?: string;
}

export function VehicleCard({ vehicle, locale, sectionSlug }: VehicleCardProps) {
  const href = sectionSlug ? `/${locale}/${sectionSlug}/${getLocalizedSlug(vehicle.slugsByLocale, locale)}` : getVehiclePath(vehicle.id, locale);

  return (
    <article className="vehicle-card">
      <ImageCarousel assets={[vehicle.image, ...vehicle.gallery]} locale={locale} href={href} ariaLabel={vehicle.name} className="vehicle-card__image" sizes="(max-width: 768px) 100vw, 33vw" showFullscreen={false} variant="card" />
      <div className="vehicle-card__body">
        <h2>{vehicle.name}</h2>
        <p>
          <NoWidowText text={getLocalizedValue(vehicle.overview, locale)} />
        </p>
        <div className="mini-specs vehicle-specs-grid">
          {vehicle.specs.map((spec) => {
            const Icon = getSpecIcon(spec.icon, spec.label.es);
            return (
              <span key={spec.label.es} className="vehicle-spec-badge">
                <Icon aria-hidden="true" className="vehicle-spec-icon" />
                <span className="vehicle-spec-label">{getLocalizedValue(spec.label, locale)}:</span>
                <span className="vehicle-spec-value">{getLocalizedValue(spec.value, locale)}</span>
              </span>
            );
          })}
        </div>
        <CardActions locale={locale} whatsappMessage={getLocalizedValue(vehicle.whatsappMessage, locale)} detailHref={href} showDetail={false} />
      </div>
    </article>
  );
}
