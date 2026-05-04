import { BoatCard } from "@/components/boats/BoatCard";
import type { Boat } from "@/types/content";
import { getLocalizedSlug, type Locale } from "@/lib/i18n";

interface BoatGridProps {
  boats: Boat[];
  locale: Locale;
}

export function BoatGrid({ boats, locale }: BoatGridProps) {
  return (
    <div className="content-grid content-grid--three">
      {boats.map((boat) => (
        <BoatCard boat={boat} locale={locale} key={boat.id} href={`/${locale}/boat/${getLocalizedSlug(boat.categorySlugsByLocale, locale)}/${getLocalizedSlug(boat.slugsByLocale, locale)}`} />
      ))}
    </div>
  );
}