# FastService

## Supabase admin

El proyecto ya esta preparado para usar Supabase como fuente de contenido, Auth para el panel y Storage para galerias.

Variables locales usadas por la app:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://srmdwudjynqovzoejcay.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<tu_publishable_key>
NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET=fastservice-gallery
```

Para activar una base nueva y dejar el panel de admin sin contenido:

1. En Supabase SQL Editor, ejecuta `supabase/schema.sql`.
2. Crea el usuario admin en Supabase Auth.
3. Ejecuta el bloque bootstrap del final de `supabase/schema.sql`, cambiando el email por el del admin.
4. Entra en `/admin/login`. Si `content_items` esta vacia, el panel queda vacio para cargar todo manualmente.

Para agregar las paginas nuevas de `Seguridad` y `Alquiler vehiculos sin conductor` en una base que ya tiene contenido guardado, ejecuta tambien:

```sql
supabase/add-security-self-drive-services.sql
```

El frontend lee primero `content_items` publicados desde Supabase. Si Supabase esta configurado y la tabla esta vacia, muestra el contenido vacio; si Supabase no esta configurado o falla la lectura, usa el contenido local como fallback.

### Checklist si falla `Guardar Supabase`

1. Confirma que `supabase/schema.sql` se ejecuto completo: tabla `content_items`, politicas RLS y bucket `fastservice-gallery`.
2. Confirma que el usuario autenticado existe en `public.admin_users` con `role = 'admin'`.
3. Confirma que `NEXT_PUBLIC_SUPABASE_URL` apunta al proyecto correcto. La configuracion de `next/image` usa ese host para mostrar imagenes de Storage.
4. Confirma que `NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET` coincide con el bucket publico usado por el uploader.
5. Si el panel muestra un error de RLS/permisos, vuelve a ejecutar las politicas del schema y reinicia sesion en `/admin/login`.
6. Si solo falla la subida de fotos/videos con `403` o `new row violates row-level security policy`, ejecuta `supabase/repair-gallery-storage-policies.sql` en Supabase SQL Editor y vuelve a iniciar sesion.

### Flujo recomendado para barcos

1. Crea o duplica el barco desde el panel.
2. Sube las fotos desde `Galeria e imagen principal`; la primera imagen queda como principal.
3. Completa alt ES/EN y slug ES/EN antes de publicar.
4. Pulsa `Guardar Supabase`; hasta ese paso, las fotos pueden estar en Storage pero el frontend no usa el cambio de contenido.
5. Abre `Ver barco` para comprobar imagen principal, galeria y ruta publica.
