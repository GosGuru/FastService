import { FiLoader } from "react-icons/fi";

export default function AdminLoading() {
  return (
    <main className="admin-loading-page">
      <div className="route-loading-card" role="status" aria-live="polite">
        <span className="route-loading-card__mark">
          <FiLoader aria-hidden="true" className="admin-spin" />
        </span>
        <strong>Cargando panel admin</strong>
        <span>Preparando contenido, sesion y conexion con Supabase.</span>
        <span className="route-loading-card__bar" />
      </div>
    </main>
  );
}
