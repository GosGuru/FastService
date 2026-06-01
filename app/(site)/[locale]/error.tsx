"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PremiumNotFoundContent } from "@/components/layout/PremiumNotFoundContent";
import { isLocale, type Locale } from "@/lib/i18n";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error }: Props) {
  const params = useParams<{ locale?: string }>();
  const locale: Locale = params?.locale && isLocale(params.locale) ? params.locale : "es";

  useEffect(() => {
    console.error(error);
  }, [error]);

  const isSpanish = locale === "es";

  return (
    <PremiumNotFoundContent
      locale={locale}
      eyebrow={isSpanish ? "No pudimos abrir esta página" : "We could not open this page"}
      title={isSpanish ? "Ups, parece que lo que buscabas no está disponible." : "Looks like what you were looking for is not available."}
      description={
        isSpanish
          ? "Puede que el enlace haya cambiado o que esa ficha ya no esté publicada. Puedes seguir navegando desde acá."
          : "The link may have changed or the listing may no longer be published. You can keep browsing from here."
      }
      question={isSpanish ? "¿Qué quieres hacer ahora?" : "What would you like to do now?"}
      note={isSpanish ? "Si buscabas una reserva concreta, te ayudamos por WhatsApp." : "If you were looking for a specific booking, we can help on WhatsApp."}
    />
  );
}
