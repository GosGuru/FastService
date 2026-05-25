-- Adds the new public service pages to Supabase content_items.
-- Run this complete file in Supabase SQL Editor.
-- This version avoids dollar-quoted JSON blocks for better dashboard compatibility.

begin;

delete from public.content_items
where content_type = 'servicePages'
  and content_id in ('service-security', 'service-self-drive');

insert into public.content_items (
  content_type,
  content_id,
  payload,
  status,
  visibility,
  robots_index,
  sort_order
)
values
(
  'servicePages',
  'service-security',
  jsonb_build_object(
    'id', 'service-security',
    'kind', 'service',
    'serviceId', 'security',
    'status', 'published',
    'visibility', 'listed',
    'robotsIndex', true,
    'slugsByLocale', jsonb_build_object(
      'es', 'seguridad',
      'en', 'security',
      'de', 'sicherheit',
      'nl', 'beveiliging'
    ),
    'title', jsonb_build_object(
      'es', 'Seguridad',
      'en', 'Security',
      'de', 'Sicherheit',
      'nl', 'Beveiliging'
    ),
    'eyebrow', jsonb_build_object(
      'es', 'Protección privada',
      'en', 'Private protection',
      'de', 'Privater Schutz',
      'nl', 'Privebeveiliging'
    ),
    'description', jsonb_build_object(
      'es', 'Seguridad y protección para villas, escolta diurna y acompañamiento nocturno o clubbing con coordinación discreta en Ibiza.',
      'en', 'Security and protection for villas, daytime escort and discreet night or clubbing accompaniment in Ibiza.'
    ),
    'image', jsonb_build_object(
      'src', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'alt', jsonb_build_object(
        'es', 'Villa privada con servicio de seguridad',
        'en', 'Private villa with security service'
      ),
      'source', 'unsplash'
    ),
    'seoTitle', jsonb_build_object(
      'es', 'Seguridad privada y escoltas en Ibiza',
      'en', 'Private security and escorts in Ibiza'
    ),
    'seoDescription', jsonb_build_object(
      'es', 'Seguridad para villas, escolta diurna y acompañamiento nocturno o clubbing en Ibiza bajo consulta por WhatsApp.',
      'en', 'Villa security, daytime escort and nightlife accompaniment in Ibiza by WhatsApp request.'
    ),
    'publishedAt', '2026-05-25',
    'updatedAt', '2026-05-25',
    'schemaType', 'Service',
    'gallery', '[]'::jsonb,
    'specs', '[]'::jsonb,
    'priceLabel', jsonb_build_object(
      'es', 'Consultar disponibilidad',
      'en', 'Consultar disponibilidad',
      'de', 'Consultar disponibilidad',
      'nl', 'Consultar disponibilidad'
    ),
    'richDescription', jsonb_build_object(
      'es', jsonb_build_object(
        'html', '<p>Seguridad y protección para villas, escolta diurna y acompañamiento nocturno o clubbing con coordinación discreta en Ibiza.</p>',
        'text', 'Seguridad y protección para villas, escolta diurna y acompañamiento nocturno o clubbing con coordinación discreta en Ibiza.'
      ),
      'en', jsonb_build_object(
        'html', '<p>Security and protection for villas, daytime escort and discreet night or clubbing accompaniment in Ibiza.</p>',
        'text', 'Security and protection for villas, daytime escort and discreet night or clubbing accompaniment in Ibiza.'
      )
    ),
    'amenities', '[]'::jsonb,
    'marina', jsonb_build_object('es', '', 'en', '', 'de', '', 'nl', ''),
    'whatsappMessage', jsonb_build_object(
      'es', 'Hola, quiero consultar servicios de seguridad privada y escolta en Ibiza.',
      'en', 'Hello, I would like to check private security and escort services in Ibiza.'
    )
  ),
  'published',
  'listed',
  true,
  3
),
(
  'servicePages',
  'service-self-drive',
  jsonb_build_object(
    'id', 'service-self-drive',
    'kind', 'service',
    'serviceId', 'self-drive',
    'status', 'published',
    'visibility', 'listed',
    'robotsIndex', true,
    'slugsByLocale', jsonb_build_object(
      'es', 'alquiler-vehiculos-sin-conductor',
      'en', 'self-drive-car-rental',
      'de', 'mietwagen-ohne-fahrer',
      'nl', 'auto-huren-zonder-chauffeur'
    ),
    'title', jsonb_build_object(
      'es', 'Alquiler vehículos sin conductor',
      'en', 'Self-drive vehicle rental',
      'de', 'Mietwagen ohne Fahrer',
      'nl', 'Auto huren zonder chauffeur'
    ),
    'eyebrow', jsonb_build_object(
      'es', 'Autonomía en la isla',
      'en', 'Island autonomy',
      'de', 'Flexibel auf der Insel',
      'nl', 'Vrij rijden op het eiland'
    ),
    'description', jsonb_build_object(
      'es', 'Tres opciones de vehículos sin conductor para moverte por Ibiza a tu ritmo. Confirmamos disponibilidad, entrega y condiciones por WhatsApp.',
      'en', 'Three self-drive vehicle options to move around Ibiza at your own pace. We confirm availability, delivery and terms by WhatsApp.'
    ),
    'image', jsonb_build_object(
      'src', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'alt', jsonb_build_object(
        'es', 'Vehículo de alquiler sin conductor en carretera',
        'en', 'Self-drive rental vehicle on the road'
      ),
      'source', 'unsplash'
    ),
    'seoTitle', jsonb_build_object(
      'es', 'Alquiler de vehículos sin conductor en Ibiza',
      'en', 'Self-drive car rental in Ibiza'
    ),
    'seoDescription', jsonb_build_object(
      'es', 'Alquiler de vehículos sin conductor en Ibiza bajo consulta por WhatsApp, sin precios publicados.',
      'en', 'Self-drive vehicle rental in Ibiza available on WhatsApp request, with no published prices.'
    ),
    'publishedAt', '2026-05-25',
    'updatedAt', '2026-05-25',
    'schemaType', 'Service',
    'gallery', '[]'::jsonb,
    'specs', '[]'::jsonb,
    'priceLabel', jsonb_build_object(
      'es', 'Consultar disponibilidad',
      'en', 'Consultar disponibilidad',
      'de', 'Consultar disponibilidad',
      'nl', 'Consultar disponibilidad'
    ),
    'richDescription', jsonb_build_object(
      'es', jsonb_build_object(
        'html', '<p>Tres opciones de vehículos sin conductor para moverte por Ibiza a tu ritmo. Confirmamos disponibilidad, entrega y condiciones por WhatsApp.</p>',
        'text', 'Tres opciones de vehículos sin conductor para moverte por Ibiza a tu ritmo. Confirmamos disponibilidad, entrega y condiciones por WhatsApp.'
      ),
      'en', jsonb_build_object(
        'html', '<p>Three self-drive vehicle options to move around Ibiza at your own pace. We confirm availability, delivery and terms by WhatsApp.</p>',
        'text', 'Three self-drive vehicle options to move around Ibiza at your own pace. We confirm availability, delivery and terms by WhatsApp.'
      )
    ),
    'amenities', '[]'::jsonb,
    'marina', jsonb_build_object('es', '', 'en', '', 'de', '', 'nl', ''),
    'whatsappMessage', jsonb_build_object(
      'es', 'Hola, quiero consultar alquiler de vehículos sin conductor en Ibiza.',
      'en', 'Hello, I would like to check self-drive vehicle rental in Ibiza.'
    )
  ),
  'published',
  'listed',
  true,
  4
);

update public.content_items
set sort_order = 5, updated_at = now()
where content_type = 'servicePages'
  and content_id = 'service-contact'
  and sort_order < 5;

commit;
