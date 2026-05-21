import { NauticalLoaderMark } from "@/components/layout/NauticalLoaderMark";

export default function SiteRouteLoading() {
  return (
    <main className="route-loading-page">
      <div className="route-loading-card" role="status" aria-live="polite">
        <NauticalLoaderMark />
        <strong>Cargando FastServices</strong>
        <span>Preparando barcos, motos de agua y fotos.</span>
        <span className="route-loading-card__bar" />
      </div>
    </main>
  );
}
