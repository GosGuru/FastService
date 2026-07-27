# FastService

Sitio bilingüe para una empresa de servicios premium en Ibiza, con catálogo de embarcaciones, blog, galerías y un panel para administrar contenido sin modificar código.

[Ver sitio](https://fast-service-pi.vercel.app/)

## Qué problema resuelve

El sitio reúne servicios con estructuras distintas —lifestyle management, seguridad, alquiler y embarcaciones— y permite que el equipo mantenga contenido e imágenes desde un único panel.

## Funcionalidad principal

- Navegación y contenido en español e inglés.
- Páginas dinámicas para servicios y elementos de catálogo.
- Catálogo de embarcaciones por categoría.
- Blog con rutas individuales.
- Panel autenticado para editar y ordenar contenido.
- Editor enriquecido para textos e imágenes.
- Galerías con subida firmada.
- Fallback local cuando Supabase no está configurado.

## Arquitectura

```text
Next.js App Router
├── (site)/[locale]       sitio público bilingüe
├── admin                 panel de contenido
├── content_items         contenido publicado
└── Storage               imágenes y galerías

Supabase Auth    → acceso administrativo
Supabase RLS     → autorización de datos y archivos
Supabase Storage → medios
```

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| Contenido dinámico con fallback local | El sitio sigue siendo navegable durante una falla o configuración incompleta del CMS. |
| Auth y RLS en Supabase | La autorización se aplica en el backend, no solo en la interfaz. |
| Slugs y texto por idioma | Evita mezclar rutas o contenido entre locales. |
| Subida firmada desde el panel | Limita las operaciones de Storage al flujo autorizado. |

## Stack

Next.js 16 · React 19 · TypeScript · Supabase Auth · PostgreSQL · Storage · Tailwind CSS · Tiptap

## Ejecutar localmente

```bash
npm install
npm run dev
```

Configura las variables en un archivo local:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET=fastservice-gallery
```

Para inicializar una base nueva:

1. Ejecuta `supabase/schema.sql`.
2. Crea el usuario en Supabase Auth.
3. Registra ese usuario en `public.admin_users`.
4. Inicia sesión en `/admin/login`.

## Verificación

```bash
npm run lint
npm run build
```

## Seguridad operativa

- No se almacenan claves privadas en el repositorio.
- Las políticas RLS controlan escritura y subida de archivos.
- El usuario debe pertenecer a `admin_users` para operar el panel.
- Los cambios se publican explícitamente desde el administrador.

## Documentación

La propuesta y las decisiones del sistema de contenido están documentadas en [SDD-Content-System-Refactor.md](SDD-Content-System-Refactor.md).

