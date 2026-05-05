import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import { ImageCarousel } from "@/components/media/ImageCarousel";
import { getVehiclePath } from "@/lib/routes";
import { getLocalizedSlug, getLocalizedValue, type Locale } from "@/lib/i18n";
import type { Vehicle } from "@/types/content";

interface VehicleCardProps {
  vehicle: Vehicle;
  locale: Locale;
  sectionSlug?: string;
}

export function VehicleCard({ vehicle, locale, sectionSlug }: VehicleCardProps) {
  const href = sectionSlug ? `/${locale}/${sectionSlug}/${getLocalizedSlug(vehicle.slugsByLocale, locale)}` : getVehiclePath(vehicle.id, locale);

  return (
    <article className="vehicle-card">
      <ImageCarousel assets={[vehicle.image, ...vehicle.gallery]} locale={locale} href={href} ariaLabel={vehicle.name} className="vehicle-card__image" sizes="(max-width: 768px) 100vw, 33vw" />
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