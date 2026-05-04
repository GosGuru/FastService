import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <h1>Page not found</h1>
      <Link href="/es">Volver al inicio</Link>
    </main>
  );
}