# FastService WhatsApp conversion redesign

**Status:** Slice A implemented locally; Slices B and C pending
**Date:** 2026-08-12
**Primary outcome:** Increase qualified WhatsApp enquiries for a specific boat without adding an owned booking or availability form.

## Problem

FastService receives traffic and catalog views, but the current home page is a full-screen lifestyle hero with scrolling intentionally disabled. It communicates the brand, but it does not expose inventory, indicative prices, comparison cues, proof, or a guided path toward asking about a boat.

Boat collection and detail pages already contain real CMS inventory and WhatsApp links, but the path is fragmented:

- the home route renders only `HomeHeroExperience`;
- reusable catalog and conversion sections exist but are disconnected from the home route;
- the hero CTA is generic rather than boat-focused;
- on mobile detail pages, the first viewport has no boat-specific CTA;
- the detail CTA says `Reservar`, although FastService intermediates and confirms availability through conversation;
- a long contact form asks for dates and other fields before opening WhatsApp;
- test FAQ content is visible on a public boat page;
- no analytics event currently distinguishes WhatsApp intent by route, placement, locale, or boat.

## User outcome

A visitor should understand within seconds that FastService helps them choose a boat in Ibiza/Formentera, see representative real boats and indicative prices, open a specific boat, and start a WhatsApp conversation carrying the relevant boat context.

## Business outcome

Measure and improve the progression:

`landing view -> catalog/detail view -> boat-specific WhatsApp click -> WhatsApp conversation -> qualified lead -> confirmed reservation`

The website can prove only through the WhatsApp click without an external integration. Conversation, lead quality, and reservation must be reconciled through WhatsApp Business labels or a lightweight CRM process.

## Constraints

- Do not add the reference design's date, passenger, budget, experience, or availability-search inputs.
- Do not imply live availability or direct booking.
- Do not rebuild the brand or replace the existing CMS/catalog architecture.
- Keep WhatsApp as the primary conversion channel.
- Continue supporting `es`, `en`, `de`, `nl`, and `ru`.
- Prices remain indicative and editable from the admin.
- Do not publish response-time, best-price, payment, review-count, or customer-count claims without verified evidence and operational ownership.

## Reference interpretation

Use the supplied desktop/mobile references for:

- strong boat-focused hero hierarchy;
- visible primary WhatsApp CTA plus secondary catalog CTA;
- featured inventory near the top;
- compact cards with model, capacity, indicative price, and a specific enquiry action;
- repeated conversion opportunities on long pages;
- responsive horizontal card browsing on mobile.

Explicitly exclude the yellow-highlighted finder form and any control that looks like a live search or booking engine.

## Proposed journey

### 1. Home entry

Hero copy changes from generic lifestyle management to the concrete job:

- H1: `Alquiler de barcos en Ibiza y Formentera`;
- short explanation: visitors can find the right boat for their day at sea;
- primary CTA: `Consultar barcos por WhatsApp`;
- secondary CTA: `Ver barcos disponibles`, anchored to featured inventory;
- factual trust points only, such as personalised attention and Ibiza/Formentera coverage.

The video and current visual identity can remain, but the page must scroll normally.

### 2. Featured boats

Show 4–6 admin-curated boats directly after the hero/process block:

- real CMS image;
- model;
- category;
- passenger capacity;
- indicative `Desde` price when available;
- primary `Consultar por WhatsApp` with model and page URL;
- secondary `Ver barco`.

Desktop uses a compact grid or rail. Mobile uses a snap-scrolling rail with one card clearly visible and the next card partially visible.

### 3. Browse by category or desired experience

Prioritise the three boat categories already in the CMS:

- Superyates;
- Yates;
- Lanchas rápidas.

Experience inspiration (Formentera, Ibiza coves, sunset, premium) comes after inventory and links to existing category/content routes. Transfers, water toys, and other services remain secondary so they do not dilute the boat conversion goal.

### 4. Boat detail conversion

- Change `Reservar {modelo}` to `Consultar este barco por WhatsApp`.
- Put a boat-specific CTA in or immediately below the mobile hero.
- Add a sticky mobile CTA after the hero enters the viewport, with safe spacing so it does not cover content.
- Message includes boat model, category, locale, and canonical URL; it does not pretend availability is known.
- Replace the long date/contact form on boat detail with a concise WhatsApp assistance panel.
- Keep specs, description, gallery, related boats, and valid FAQs.

## Information architecture

Recommended home order:

1. Boat-focused hero.
2. Featured boats described as some of the most requested inventory.
3. Boat categories framed as Mediterranean lifestyle options.
4. Existing secondary services and footer.

This order keeps the existing FastService proposition focused on inventory, lifestyle, and direct boat clicks.

## CMS and data requirements

- Add `featured` and `featuredOrder` to boat payloads; no relational schema change is required because boat payloads are JSON.
- Admin provides a `Destacado en home` control and ordering, with a recommended maximum of six visible boats.
- Preserve `priceLabel`; display a short disclaimer when prices are shown: indicative and subject to date, route, extras, and availability.
- Hide incomplete or internal/test FAQs from production immediately.
- Do not hardcode static featured IDs that do not match restored CMS UUIDs.

## WhatsApp message design

### Home

`Hola, quiero ayuda para elegir un barco en Ibiza o Formentera.`

### Boat card/detail

`Hola, quiero consultar disponibilidad del {tipo} {modelo}. Lo vi aquí: {canonicalUrl}`

The team can then ask date, passengers, budget range, and preferred plan inside WhatsApp. The website should not make visitors complete those fields first.

## Measurement plan

### Web events

Track without message contents or personal data:

- `wa_click` with `placement`, `route`, `locale`, `boat_id`, and `boat_category`;
- `boat_card_view` and `boat_detail_view`;
- `catalog_cta_click`;
- `featured_boat_click`;
- `language_change`.

Required placements include `hero`, `featured_card`, `category_card`, `detail_hero`, `detail_sticky`, `related_boat`, and `final_cta`.

### Funnel metrics

- home-to-catalog click-through rate;
- catalog-to-detail rate;
- WhatsApp click-through rate by route and placement;
- boat-specific versus generic WhatsApp click share;
- mobile versus desktop WhatsApp click rate;
- WhatsApp conversation-to-qualified-lead rate (manual/CRM reconciliation);
- qualified-lead-to-reservation rate (manual/CRM reconciliation).

Do not claim that a `wa_click` is a conversation or reservation.

### Rollout comparison

Record a baseline before release if existing analytics permit it. If no baseline exists, treat the first seven days after instrumentation as the baseline and compare the following seven days, segmented by traffic source and device. Avoid interpreting low-volume day-to-day changes as a conversion lift.

## Accessibility and responsive requirements

- One clear H1 per page and logical heading order.
- CTA labels describe the result, not only `Contacto` or `Disponibilidad`.
- Minimum 44×44 px touch targets.
- Keyboard-visible focus for cards, carousels, menus, and CTAs.
- Sticky mobile CTA must not obscure copy, gallery controls, cookie notices, or browser safe areas.
- Respect reduced-motion settings; video cannot be required to understand the offer.
- Maintain readable contrast over video and images.
- Horizontal mobile rails must remain keyboard-scrollable and expose meaningful accessible names.

## Release slices

### Slice A — seasonal conversion MVP

- Restore home scrolling.
- Compose the boat-focused hero, featured boats, and category links from existing components.
- Remove form-like finder controls entirely.
- Replace booking language with consultation language.
- Add boat-aware WhatsApp URLs and event hooks.

**Success evidence:** responsive home screenshots, all five locales build, real CMS boats/prices visible, CTA messages verified, lint/build pass.

### Slice B — detail and trust hardening

- Add detail-hero and sticky mobile boat-specific CTA.
- Replace the long contact/date form on boat details with a WhatsApp panel.
- Remove test FAQ content and audit all public trust claims.
- Verify related-boat path and repeated CTA hierarchy.

**Success evidence:** desktop/mobile detail flow, no content overlap, no internal/test copy, anonymous users cannot edit content.

### Slice C — curation and learning loop

- Add admin featured controls and ordering.
- Connect analytics provider/event sink and build a small weekly conversion report.
- Reconcile WhatsApp labels for qualified lead and reservation outcomes.
- Iterate copy/order only after enough segmented evidence exists.

## Acceptance criteria

- Home scrolls and exposes real boat inventory within the first two mobile viewports and first desktop viewport transition.
- No date/person/budget/experience finder form exists on home.
- Every featured boat links to its detail and opens a boat-specific WhatsApp message.
- Mobile detail exposes a boat-specific CTA without requiring a long form or scroll to the footer.
- No CTA claims direct booking or known availability.
- No test content or unverified trust claim appears publicly.
- Featured content is controlled through the admin and survives reload.
- WhatsApp click events can be segmented by placement, route, locale, device, and boat.
- Existing catalog, Supabase content, R2 media, authentication, locales, and SEO routes remain functional.
- `npm run lint` and `npm run build` pass, followed by desktop/mobile production smoke checks.

## Risks and mitigations

- **More WhatsApp clicks but poor leads:** preserve boat/model context and reconcile lead quality in WhatsApp Business.
- **Too many CTAs create noise:** one primary CTA style and one secondary catalog style; repeat only at meaningful decision points.
- **Unverified social proof harms trust:** publish only sourced Google rating/reviews and current operational claims.
- **Generic inventory order underperforms:** make featured selection explicit in admin instead of relying on first-row order.
- **Visual redesign delays seasonal value:** reuse the existing brand, components, CMS data, and media; prioritise hierarchy and composition.

## Decision log

- **2026-08-12:** WhatsApp is the owned conversion channel; date and booking handling remain conversational/third-party.
- **2026-08-12:** Use the supplied references for hierarchy and conversion cadence, not as a literal clone.
- **2026-08-12:** Explicitly exclude the highlighted finder form.
- **2026-08-12:** Prioritise a seasonal MVP using existing sections and catalog data rather than a ground-up rebuild.
- **2026-08-12:** Preserve the existing responsive hero video and place the conversion hierarchy over it; the video pauses outside the viewport and is not required to understand the offer.
- **2026-08-12:** Since there is no general boat-catalog route, the featured-section browse CTA links honestly to the category section instead of claiming to show all boats.
- **2026-08-12:** Remove the assisted-selection, three-step process, coordination, and trust-copy sections. Conversion improvements must use approved FastService inventory and lifestyle language only; ask before introducing a new marketing proposition.

## Slice A implementation evidence

- Home now scrolls normally and composes the aligned video hero, featured inventory, and lifestyle categories without adding a new service narrative.
- No date, passenger, budget, experience, or availability-search fields were added.
- WhatsApp click hooks emit `wa_click` with placement, route, locale, and optional boat/category identifiers without recording message contents.
- Desktop and mobile browser checks confirmed the hero video plays while visible, CTAs fit their cards, the mobile featured rail scrolls horizontally, and no page-level horizontal overflow or console errors are present.
- `npm run lint`, `npm run build`, and React Doctor completed successfully on 2026-08-12.
- The static fallback dataset still contains generic Unsplash imagery for some boat records. Real restored CMS/R2 media remains a data-readiness dependency, not a Slice A layout claim.
