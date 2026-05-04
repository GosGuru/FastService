import Link from "next/link";
import { MediaImage } from "@/components/MediaImage";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { getVehiclePath } from "@/lib/routes";
import { getLocalizedValue, type Locale } from "@/lib/i18n";
import type { Vehicle } from "@/types/content";

interface VehicleCardProps {
  vehicle: Vehicle;
  locale: Locale;
}

export function VehicleCard({ vehicle, locale }: VehicleCardProps) {
  return (
    <article className="vehicle-card">
      <Link className="vehicle-card__image" href={getVehiclePath(vehicle.id, locale)}>
        <MediaImage asset={vehicle.image} locale={locale} sizes="(max-width: 768px) 100vw, 33vw" />
      </Link>
      <div className="vehicle-card__body">
        <h2>{vehicle.name}</h2>
        <p>{getLocalizedValue(vehicle.overview, locale)}</p>
        <div className="mini-specs">
          {vehicle.specs.slice(0, 3).map((spec) => (
            <span key={spec.label.es}>{getLocalizedValue(spec.value, locale)}</span>
          ))}
        </div>
        <WhatsAppCta locale={locale} message={getLocalizedValue(vehicle.whatsappMessage, locale)} variant="outline" />
      </div>
    </article>
  );
}