# Editor de Inicio en el panel admin

**Estado:** Implementado localmente; pendiente validación interactiva con sesión admin
**Fecha:** 2026-08-12
**Objetivo:** Parametrizar la home actual sin modificar su diseño público.

## 1. Problema y resultado esperado

La home usa hoy textos, selección de barcos y orden de categorías definidos en código. El administrador necesita una sección **Inicio** para controlar estos contenidos sin depender de una nueva publicación de código.

El resultado debe mantener exactamente la composición visual actual, pero permitir desde `/admin`:

- editar el título y la descripción del hero;
- editar el título y la descripción de **Barcos destacados**;
- elegir y ordenar los cuatro barcos destacados entre todo el catálogo;
- editar el título **Tres formas de vivir el Mediterráneo**;
- ordenar las tres categorías públicas de barcos;
- publicar los cambios mediante el flujo autenticado ya existente.

Orden inicial requerido para las categorías:

1. Embarcaciones rápidas (`fast-boats`)
2. Yates (`yachts`)
3. Yates XL (`yachts-xl`)

## 2. Alcance

### Incluido

- Nueva entrada **Inicio** como primera sección del menú del administrador.
- Edición localizada para ES, EN, DE, NL y RU usando las pestañas de idioma existentes.
- Selector visual de barcos con búsqueda, filtro por categoría, miniatura, nombre y precio.
- Selección exacta de cuatro barcos, sin duplicados, y reordenamiento por arrastre y botones accesibles.
- Reordenamiento de las tres categorías por arrastre y botones subir/bajar.
- Vista previa resumida de la home y enlace **Ver Inicio** en una pestaña nueva.
- Guardado en Supabase, validación, revalidación de la home y fallback seguro.
- Aplicación del nuevo orden inicial solicitado.

### No incluido

- Cambiar el video, CTA, franja de islas, imágenes o diseño público.
- Crear, editar o borrar barcos desde Inicio; eso continúa en **Barcos**.
- Ocultar categorías o añadir categorías distintas de las tres actuales.
- Cambiar automáticamente el título SEO o la descripción metadata al editar el hero.
- Flujo borrador/publicación programada, historial de versiones o traducción automática nueva.

## 3. Evidencia del estado actual

- `HomeHeroExperience.tsx` contiene el título y la descripción del hero en un objeto local por idioma.
- `HomeConversionSections.tsx` contiene los títulos de secciones, selecciona automáticamente cuatro barcos y renderiza las categorías en el orden recibido.
- `page.tsx` ya carga barcos y colecciones desde `getPublicContent()`.
- El administrador ya tiene autenticación, detección de cambios sin guardar, pestañas de idioma y componentes DnD.
- La configuración se guarda en `content_items` como `content_type = 'settings'` y `content_id = 'site-settings'`.
- La restricción de `content_items` ya permite el tipo `settings`, por lo que este diseño no requiere una nueva tabla ni una migración de esquema.

## 4. Modelo de datos

Extender `SiteSettings` con una propiedad `home` versionada y tipada:

```ts
interface HomeSettings {
  version: 1;
  hero: {
    title: LocalizedText;
    description: LocalizedText;
  };
  featured: {
    title: LocalizedText;
    description: LocalizedText;
    boatIds: string[]; // exactamente 4, orden de render
  };
  categories: {
    title: LocalizedText;
    collectionIds: BoatCollectionId[]; // los 3 IDs, orden de render
  };
}
```

La configuración completa continúa en una sola fila:

```text
content_type = settings
content_id   = site-settings
payload      = { whatsappNumbers, home, updatedAt }
```

### Valores iniciales

- Los textos iniciales serán exactamente los que hoy están publicados en los cinco idiomas.
- `featured.boatIds` se inicializará con los cuatro barcos que hoy devuelve el selector automático, conservando su orden visible.
- `categories.collectionIds` se inicializará como `['fast-boats', 'yachts', 'yachts-xl']`.

### Normalización y compatibilidad

`normalizeSiteSettings()` deberá:

1. combinar el payload remoto con los valores por defecto;
2. completar estructuras antiguas que solo contengan WhatsApp;
3. eliminar IDs duplicados o inexistentes;
4. completar barcos faltantes con el selector heredado hasta llegar a cuatro;
5. completar categorías faltantes con los tres IDs canónicos;
6. nunca impedir que la home renderice si Supabase está vacío o no disponible.

Los IDs son referencias; el contenido visual y comercial de cada tarjeta seguirá procediendo del catálogo de barcos/colecciones. No se duplicarán nombres, precios ni imágenes dentro de la configuración de Inicio.

## 5. Experiencia del administrador

### Navegación

- **Inicio** será la primera opción del menú y la sección abierta por defecto.
- Icono sugerido: `FiHome`.
- Descripción: “Hero, destacados y categorías de la portada”.

### Editor

El editor tendrá tres bloques claros:

#### A. Hero

- Pestañas ES/EN/DE/NL/RU.
- Campo **Título principal** con contador y aviso si genera demasiadas líneas.
- Campo **Descripción** con contador.
- Vista previa compacta del texto sobre fondo oscuro.

#### B. Barcos destacados

- Campos localizados **Título** y **Descripción**.
- Zona **Seleccionados (4/4)** con tarjetas ordenables.
- Botón **Cambiar barcos** abre un selector/modal.
- El selector muestra todo el catálogo con:
  - búsqueda por nombre;
  - filtro: Todos, Embarcaciones rápidas, Yates, Yates XL;
  - miniatura, categoría, nombre y precio;
  - estado seleccionado y posición;
  - máximo de cuatro selecciones, con mensaje claro al alcanzar el límite.
- El orden de los seleccionados controla el orden público.

#### C. Categorías del Mediterráneo

- Campo localizado **Título de sección**.
- Lista fija de las tres categorías con imagen y nombre tomados del catálogo.
- Reordenamiento por DnD y botones subir/bajar para teclado y móvil.
- Orden inicial: Embarcaciones rápidas, Yates, Yates XL.

### Guardado y feedback

- Un único botón **Publicar Inicio** guarda `settings.home` junto con el resto de `SiteSettings` sin sobrescribir WhatsApp.
- Si hay cambios sin guardar, se mantiene el aviso al abandonar la página.
- Éxito: “Inicio publicado. La portada ya usa esta configuración.”
- Error: mantener los cambios en memoria y mostrar el motivo sin reemplazar la configuración publicada.

## 6. Flujo público

1. `app/(site)/[locale]/page.tsx` cargará en paralelo contenido y `loadPublicSiteSettings()`.
2. Pasará `settings.home` a `HomeHeroExperience` y `HomeConversionSections`.
3. El hero resolverá título y descripción con `getLocalizedValue`.
4. Los destacados se resolverán por `boatIds`, preservando el orden de configuración.
5. Las categorías se resolverán por `collectionIds`, preservando el orden configurado.
6. Si falta una referencia, la normalización aplicará el fallback y la home seguirá visible.
7. El HTML y CSS público no cambiarán: solo cambia la fuente de datos.

## 7. Validación

Antes de guardar:

- título y descripción del hero no vacíos en los cinco idiomas;
- título y descripción de destacados no vacíos en los cinco idiomas;
- título de categorías no vacío en los cinco idiomas;
- exactamente cuatro IDs de barcos, únicos y existentes;
- exactamente los tres IDs canónicos de colección, sin duplicados;
- ningún barco seleccionado puede estar oculto o haber sido eliminado.

La validación se realizará tanto en cliente para feedback inmediato como en la server action antes de persistir.

## 8. Seguridad y permisos

- Solo una sesión validada por `getAdminSession()` puede guardar.
- Se conserva la política RLS actual: solo `app_private.is_admin()` administra `content_items`.
- El frontend público solo lee la fila publicada.
- La server action aceptará un objeto normalizado y no confiará únicamente en la validación cliente.
- No se introducen claves privilegiadas en el navegador ni acceso directo del cliente a la base.

## 9. Implementación por etapas

### Etapa 1 — Dominio y persistencia

- Añadir `HomeSettings`, defaults y normalizador en `types/settings.ts` / `lib/siteSettings.ts`.
- Añadir validación server-side en `saveSiteSettingsAction` o un helper compartido.
- Cubrir payload antiguo, IDs inválidos y fallos de Supabase.

**Fin verificable:** una configuración antigua se carga con la home actual y puede guardarse sin perder WhatsApp.

### Etapa 2 — Consumo público

- Cargar settings en la home.
- Sustituir textos hardcodeados y selección automática por la configuración normalizada.
- Aplicar el orden inicial `fast-boats → yachts → yachts-xl`.

**Fin verificable:** la home luce igual y responde a cambios del payload.

### Etapa 3 — Editor Inicio

- Añadir Inicio al menú y extraer un `HomeSettingsEditor` para no seguir creciendo `AdminDashboard.tsx`.
- Implementar campos localizados, selector de barcos, filtros y listas ordenables.
- Integrar dirty state, confirmación de salida, feedback y enlace de vista pública.

**Fin verificable:** un admin puede editar, seleccionar, ordenar y publicar sin usar el editor de Barcos.

### Etapa 4 — QA y entrega

- Probar desktop y móvil del admin.
- Probar home en los cinco idiomas y distintos viewports.
- Verificar que editar Inicio no altera WhatsApp ni el catálogo.
- Revisar RLS y los caminos permitido/denegado.

## 10. Estrategia de pruebas

### Unitarias

- normalización de payload antiguo;
- orden y deduplicación de IDs;
- fallback de barco eliminado/oculto;
- resolución localizada;
- validación de cuatro destacados y tres categorías.

### Integración

- admin autenticado guarda y revalida;
- usuario no autenticado recibe rechazo;
- guardar Inicio conserva `whatsappNumbers`;
- la home respeta textos y órdenes persistidos;
- fallo de Supabase mantiene defaults y no rompe el render.

### Navegador

- selector de barcos con búsqueda y filtro;
- DnD y botones accesibles;
- feedback, foco y cambios sin guardar;
- consistencia visual pública desktop/móvil;
- cero overflow horizontal y cero errores de consola.

### Comandos

- `npm run lint`
- `npm run build`
- `npx -y react-doctor@latest . --scope changed`
- `git diff --check`

## 11. Rollout y rollback

### Rollout

1. Publicar código con defaults compatibles antes de cambiar datos.
2. Verificar que el payload actual de `site-settings` carga correctamente.
3. Guardar desde Inicio para materializar `home` en el JSON existente.
4. Confirmar en ES, EN, DE, NL y RU.

### Rollback

- Revertir el código devuelve el comportamiento hardcodeado anterior; el campo `home` adicional queda inocuo en JSON.
- Si la configuración resulta inválida, eliminar solo `payload.home` o restaurar sus defaults, sin tocar WhatsApp ni el catálogo.
- No hay tabla nueva ni migración destructiva que deshacer.

## 12. Criterios de aceptación

- [x] Inicio aparece primero y abre por defecto en `/admin`.
- [x] Los textos solicitados son editables en los cinco idiomas.
- [x] Se pueden elegir exactamente cuatro barcos de todo el catálogo y ordenar su aparición.
- [x] Las categorías comienzan como Embarcaciones rápidas, Yates, Yates XL y pueden reordenarse.
- [x] La home pública mantiene la misma estructura y estilos actuales.
- [x] Un payload anterior continúa funcionando sin edición manual.
- [x] Guardar Inicio no altera WhatsApp ni los registros de barcos/colecciones.
- [x] Solo administradores pueden guardar.
- [ ] QA interactivo del editor con sesión admin autenticada (la sesión de navegador disponible redirigió a login).

## 13. Decisiones

| Decisión | Motivo |
| --- | --- |
| Guardar Inicio dentro de `settings/site-settings` | Reutiliza persistencia, permisos y compatibilidad existentes; no requiere otra tabla. |
| Referenciar barcos y categorías por ID | Evita duplicar información y mantener copias divergentes. |
| Mantener cuatro destacados | Conserva exactamente la composición visual actual. |
| Categorías fijas pero ordenables | El alcance pide ordenar las tres existentes, no crear una taxonomía nueva. |
| No vincular hero con metadata SEO | Evita cambios SEO accidentales fuera del alcance. |
| Extraer `HomeSettingsEditor` | Reduce el riesgo de seguir ampliando el componente monolítico del dashboard. |

## 14. Evidencia de implementación

- `npx tsc --noEmit`: correcto.
- `npm run lint`: correcto, sin errores ni advertencias.
- `npm run build`: correcto; 195 páginas generadas.
- QA pública desktop: 4 destacados, orden Embarcaciones rápidas → Yates → Yates XL, sin overflow ni errores de consola.
- QA pública móvil 390×844: hero ajustado al viewport, CTA visible, video móvil reproduciendo (`readyState = 4`) y sin overflow.
- React Doctor: un aviso preexistente por la cantidad de estados del dashboard monolítico; el nuevo editor está extraído en un componente propio.
