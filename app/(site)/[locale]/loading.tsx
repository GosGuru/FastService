import { FiLoader } from "react-icons/fi";

export default function SiteRouteLoading() {
  return (
    <main className="route-loading-page">
      <div className="route-loading-card" role="status" aria-live="polite">
        <span className="route-loading-card__mark">
          <FiLoader aria-hidden="true" className="admin-spin" />
        </span>
        <strong>Cargando FastServices</strong>
        <span>Preparando contenido e imagenes.</span>
        <span className="route-loading-card__bar" />
      </div>
    </main>
  );
}
