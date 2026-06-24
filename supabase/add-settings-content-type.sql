-- Migración para solucionar el error al guardar la configuración (settings).
-- Ejecuta este script en el editor SQL de Supabase para admitir el tipo de contenido 'settings'.

ALTER TABLE public.content_items 
  DROP CONSTRAINT IF EXISTS content_items_content_type_check;

ALTER TABLE public.content_items 
  ADD CONSTRAINT content_items_content_type_check 
  CHECK (content_type IN ('boatCollections', 'boats', 'servicePages', 'vehicles', 'waterToys', 'seoPages', 'faqs', 'settings'));
