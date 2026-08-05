# Public content fallback

## Problem and user outcome

Production catalog and service URLs render the custom not-found page when the
public Supabase snapshot is unavailable, empty, or missing a content group. The
public site must remain navigable from listing pages through each detail page by
using the versioned local content as a read-only fallback.

## Goals

- Keep Supabase-published rows authoritative for every content group it returns.
- Fill content groups absent from the public query with the local seed snapshot.
- Use the complete local snapshot when public Supabase cannot be queried or has
  no published rows.
- Preserve the current admin behavior so an empty or failed remote read is not
  silently presented as remote admin data.

## Non-goals

- Changing Supabase schema, RLS, credentials, or production data.
- Deploying or modifying the production environment.
- Replacing explicitly returned remote rows with local rows.

## Current-state evidence

- Live catalog, boat, service, and item URLs resolve to the custom not-found UI.
- `loadRows` currently builds public snapshots from an empty fallback.
- `README.md` documents local content fallback as an architectural guarantee.

## Requirements and edge cases

- Without Supabase configuration, public reads return the normalized local seed.
- On public query errors or zero published rows, public reads return the local seed.
- For a partial public result, each returned content type replaces its local group;
  content types absent from the result retain their local seed group.
- Admin reads retain the empty fallback and existing error messaging.

## Acceptance criteria

- A local production build without Supabase configuration exposes collection,
  boat, service, vehicle, and water-toy routes instead of the not-found page.
- Lint and production build pass.
- No database migration or credential change is required.

## Test strategy

- Run `npm run lint` and `npm run build`.
- Start the production server and request representative public routes for every
  dynamic content family, checking HTTP status and page title/content.

## Rollout, rollback, and risks

- Rollout requires a normal application deployment after review.
- Roll back the application change to restore the prior fail-closed behavior.
- Local seed content can be stale; remote rows remain authoritative whenever a
  content type is present in the published query.

## Decision log

- Use local seeds only for public reads. Admin reads remain fail-closed to avoid
  presenting fallback content as remote editable state.
