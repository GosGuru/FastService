# FastService production recovery

**Status:** Production cutover complete; admin activation pending
**Started:** 2026-08-12
**Specification:** `docs/sdd/supabase-storage-recovery-r2.md`

## Objective

Rebuild FastService on a replacement hosted Supabase Free project, migrate verified media to Cloudflare R2, connect Vercel, and restore the admin-authored public catalog without modifying or deleting the paused source project.

## Safety boundaries

- Preserve both original downloads and their hashes.
- Do not execute the recovered SQL blindly; restore only reviewed schema/data/auth requirements.
- Do not expose or commit secrets.
- Do not delete the paused project, source exports, or orphan candidates.
- Stop for action-time confirmation if checkout/payment-method submission is required.
- Production cutover must retain the current deployment as rollback.

## Progress

- [x] Source repository restored at `3308fd0655e97c49e951dd1c5f011998397aed5f`.
- [x] Database and Storage exports downloaded and integrity checked.
- [x] Inventory: 52 CMS rows, 267 objects, 223 referenced/present, 44 orphan candidates, 2 referenced/missing.
- [x] Authorized resume attempted; blocked by organization Fair Use restriction.
- [x] Create a healthy replacement Supabase Free project in `eu-west-1` under the clean FastService Recovery organization.
- [x] Apply reviewed schema/RLS and import all 52 CMS rows.
- [ ] Create a new admin identity and revoke reliance on exposed bootstrap credentials.
- [x] Produce optimized referenced-media package and manifest.
- [x] Create an EU-jurisdiction R2 Standard bucket; enable a temporary public `r2.dev` origin pending a custom domain.
- [x] Upload all 223 verified objects and rewrite CMS media origins.
- [x] Implement R2 signed upload/delete flow and future image controls.
- [x] Configure Vercel and run local/security/content/media tests.
- [x] Cut over production and verify public routes and anonymous upload denial.

## Source evidence

- Database: `C:/Users/Maxim/Downloads/db_cluster-06-08-2026@16-46-55.backup.gz`
- Storage: `C:/Users/Maxim/Downloads/srmdwudjynqovzoejcay.storage.zip`
- Source Supabase project remains paused and recoverable until 2027-09-11.
- Billing restriction: `Storage Size Exceeded`, HTTP 402.

## Implementation order

1. Provision replacement Supabase project without changing Vercel.
2. Apply repository schema plus reviewed deltas and import only application-owned CMS data.
3. Create/authorize a fresh admin through supported Auth APIs; never import the exposed password.
4. Optimize referenced media into a separate output tree while preserving the originals and stable object keys.
5. Provision R2, upload media, compare manifest counts/bytes/hashes, and configure custom delivery domain.
6. Add server-only R2 credentials and direct signed uploads; validate anonymous/non-admin/admin paths.
7. Rewrite recovered CMS URLs to the R2 public origin and validate all 52 rows and 223 present objects.
8. Configure a Vercel preview, run lint/build/smoke/security checks, then update production and retain rollback deployment.

## Validation ledger

| Check | Result | Evidence |
|---|---|---|
| Storage ZIP integrity | Passed | 267 files; 1,378,325,193 uncompressed bytes |
| CMS parse without SQL execution | Passed | 52 rows; 225 unique referenced keys |
| Source resume | Blocked | Organization quota restriction remains |
| Media optimization | Passed | 223 ready; 2 missing; 1,185,218,253 -> 166,728,752 bytes |
| Replacement Supabase | Passed | `eilipheaulofoxgndiqf`, Healthy, eu-west-1 |
| CMS restore | Passed | 52 rows; counts match the source inventory |
| R2 object migration | Passed | 223 objects; 166,728,752 bytes; zero errors |
| CMS URL rewrite | Passed | 52 rows; 0 old-origin rows; 0 missing-path rows; 40 R2-backed rows |
| Public R2 sample | Passed | HTTP 200; MP4 length/type/cache headers match manifest |
| Application checks | Passed locally | `npm run lint`; `npm run build`; `npm audit` 0 vulnerabilities |
| Production deploy | Passed | Vercel deployment from commit `26b3a354221831c1859dffd8e2693029acce38c0` reached `READY` with all production aliases |
| Public route smoke | Passed | `/es`, `/es/yates`, `/es/transfer-privado`, `/es/juguetes-nauticos`, `/es/contacto` returned HTTP 200 |
| Anonymous media write | Passed | `POST /admin/storage/sign-upload` returned HTTP 401 |
| Runtime errors | Passed | Vercel reported no runtime errors after the production smoke requests |

## Rollback

- Keep the paused source project and both exports unchanged.
- Keep current Vercel environment values and deployment ID until cutover validation.
- If preview or production fails, restore prior Vercel environment values/deployment.
- Retain pre-rewrite CMS data export and R2 manifest.

## Discoveries and decisions

- The database is small; original unoptimized JPG files caused the incident.
- R2 stores media only. Supabase remains the source of truth for content/Auth/RLS.
- Only referenced media migrates during cutover; orphan candidates remain quarantined.
- Two missing referenced objects need explicit content fallback/replacement before launch.
- The optimized R2 package is at `C:/Users/Maxim/Downloads/fastservice-r2-ready-20260812`; source backups remain unchanged and SHA-256 values are in `manifest.json`.
- With explicit authorization, the empty unhealthy replacement was deleted to free the account slot. The clean organization now hosts the healthy replacement project; SomosCamper was not modified.
- R2 bucket `fastservice-gallery` uses EU jurisdiction and a least-privilege account token scoped to object read/write on that bucket only. CORS is limited to FastService production/main origins.
- The temporary public origin is rate-limited `r2.dev`. It unblocks recovery but remains a production follow-up until the DNS zone can provide a custom media domain.
- The first production smoke exposed a stale Vercel Supabase publishable key: routes returned local seed content even though the new database was healthy. The key and canonical site URL were corrected and their Vercel update timestamps were verified; final catalog/media confirmation must use the deployment triggered after both persisted changes.
