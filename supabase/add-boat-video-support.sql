-- Ejecutar si ya tienes el proyecto creado y no quieres relanzar schema.sql completo.
-- Los campos de la ficha individual del barco viven en content_items.payload (JSONB):
--   payload.description  -> descripcion rich text por idioma
--   payload.amenities    -> equipamiento por idioma (tambien acepta strings legacy)
--   payload.marina       -> puerto/marina por idioma
--   payload.video        -> video opcional de la ficha individual
-- Por eso no hace falta ALTER TABLE para estos campos; solo ampliar Storage para videos.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fastservice-gallery',
  'fastservice-gallery',
  true,
  209715200,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;