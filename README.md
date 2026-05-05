# FastService

## Supabase admin

El proyecto ya esta preparado para usar Supabase como fuente de contenido, Auth para el panel y Storage para galerias.

Variables locales usadas por la app:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://uuvpspxnijthjwmksrer.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__jumyJ8mM8facfXfnum4KA_IX0YM9vy
NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET=fastservice-gallery
```

Para activar la base:

1. En Supabase SQL Editor, ejecuta `supabase/schema.sql`.
2. Crea el usuario admin en Supabase Auth.
3. Ejecuta el bloque bootstrap del final de `supabase/schema.sql`, cambiando el email por el del admin.
4. Entra en `/admin/login`, inicia sesion y pulsa `Guardar Supabase` para sembrar el contenido local inicial en `content_items`.

El frontend lee primero `content_items` publicados desde Supabase. Si la tabla esta vacia o aun no existe, usa el contenido local como fallback para no dejar la web en blanco.
