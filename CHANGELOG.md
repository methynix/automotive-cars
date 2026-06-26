# Future Automotive — v2 Production Overhaul

Everything below is real-data, end-to-end. No mock/hardcoded data remains in the app.

## How the whole thing fits together (flow)

**Public visitor**
1. Loads the React SPA (`car_review_front`). Data is fetched from the Express API (`car_reviewdb`) via React Query.
2. Home / Garage (`/cars`) → `GET /api/reviews` with **server-side** search, sort, filter (manufacturer, body style, condition, price, mileage, drivetrain) and pagination. All filter state lives in the **URL**, so a filtered view is shareable and survives refresh.
3. Vehicle detail (`/cars/:slug`) → `GET /api/reviews/:slug` (also increments views). Visitor can read the review + approved comments, post a comment (`POST /api/reviews/:id/comments` → goes to moderation), configure paint/interior, and **book a test drive** (`POST /api/leads`).
4. Compare (`/compare?v=slugA,slugB`) → picks up to 3 vehicles; the better spec per row is highlighted. Selection is in the URL.
5. News (`/news`) → `GET /api/news` (RSS aggregation).

**Accounts & roles (the security model)**
- Public **sign-up always creates a `user` (customer)** — `POST /api/auth/register` hard-codes `role: 'user'`. There is no way to self-assign admin.
- Every `/api/admin/*` route re-checks the caller's role **against the database** on each request (`requireStaff` = admin/editor, `requireAdmin` = admin only). A token alone proves nothing; the DB is the source of truth. Suspended accounts are blocked.
- After sign-in/up: **staff → `/admin`, customers → `/`** (role-based redirect).
- A 401 from any call triggers a global "force logout" (token cleared, user bounced) via an event the API client dispatches.

**Staff (admin/editor) — `/admin`**
- **Dashboard**: real analytics (counts, total views, avg rating, new leads, pending comments) + a chart of the most-viewed vehicles.
- **Vehicles**: full CRUD — create/edit (with validation + **Supabase image upload**), publish/unpublish toggle, soft-delete.
- **Brands**: CRUD (drives the catalog's manufacturer filter).
- **Leads**: see every test-drive request, change status, delete.
- **Users** (admin only): change roles, suspend/reactivate, delete (can't touch your own account).

---

## Backend changes (`car_reviewdb`)

- `prisma/schema.prisma` — specs is now **1:1** with Review (enables server-side sort/filter on price/mileage); added `body_style`, `condition` (enum) on Review, `mileage` on ReviewSpec, `status` on Profile; new **Brand** and **Lead** models; `Condition` + `LeadStatus` enums.
- `prisma/migrations/20260615000000_add_profile_auth/migration.sql` — (v1) fixes the profiles table missing `email`/`password_hash`.
- `prisma/migrations/20260616000000_marketplace/migration.sql` — adds the new columns/enums/tables, de-dupes specs and enforces the 1:1 unique index, indexes for filtering.
- `prisma/seed.js` — seeds 5 brands + body_style/condition/mileage per vehicle (admin creds from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).
- `src/middlewares/auth.middleware.js` — added `requireStaff` (admin|editor), kept `requireAdmin` (admin only), blocks suspended accounts, DB-verified roles.
- `src/services/` — `review.service.js` (server-side `buildOrderBy` + `buildPublicWhere`, publish toggle, 1:1 spec upsert); new `brand.service.js`, `lead.service.js`, `user.service.js`, `analytics.service.js`.
- `src/controllers/` — updated `review.controller.js` (filters + publish + admin list); new `brand`, `lead`, `user`, `analytics` controllers.
- `src/validators/` — updated `review.validator.js` (non-negative price/mileage/hp, body_style/condition enums, rating 0–10); new `lead`, `brand`, `user` validators.
- `src/routes/admin.routes.js` — reviews CRUD + publish + restore, comments moderation, **brands/users/leads CRUD**, analytics. User routes are admin-only.
- `src/routes/public.routes.js` — reviews (with filters) + featured + slug, comments, **`GET /api/brands`**, **`POST /api/leads`**.

## Frontend changes (`car_review_front`)

- `package.json` — added `@tanstack/react-query`.
- `src/main.tsx` + `src/lib/queryClient.ts` — React Query provider.
- `src/lib/api.ts` — **rewritten**: real-data only, unwraps `{success,data,pagination}`, attaches bearer token, **401 interceptor** (clears token + dispatches `auth:logout`). All endpoints (public + admin + upload).
- `src/lib/types.ts` — Brand, Lead, AppUser, Analytics, Condition, new review/spec fields, expanded `ReviewFilters`, News types matched to backend.
- `src/lib/auth.tsx` — rewritten on the new client; exposes `isAdmin`/`isStaff`; listens for the forced-logout event.
- `src/lib/constants.ts` — added BODY_STYLES, CONDITIONS, DRIVETRAINS, SORT_OPTIONS, DEALER_LOCATIONS (existing constants kept).
- `src/hooks/useApi.ts` — **new**: React Query hooks for every endpoint.
- `src/components/sections/Comments.tsx` — **new**: lists approved comments + moderated submit form.
- `src/pages/SignInPage.tsx` / `SignUpPage.tsx` — show/hide password, email trim, confirm-password + strength meter, role-based redirect, "creates a customer account".
- `src/pages/CarListingsPage.tsx` — **rewritten**: server-side sort/filter/pagination, URL-persisted filters, body_style/condition/mileage filters, data-driven manufacturer list.
- `src/pages/CarDetailsPage.tsx` — **rewritten**: React Query, real test-drive **lead form**, stateful configurator, mounted Comments, share-link.
- `src/pages/CompareVehiclesPage.tsx` — **rewritten**: user-selectable (URL-persisted), **winner highlighting**, per-car CTAs.
- `src/pages/AdminPage.tsx` — **rewritten**: full CRUD console (dashboard/vehicles/brands/leads/users/settings), Supabase upload, client validation, role guard.
- `src/components/sections/TrendingCars.tsx` — data-driven (no hardcoded brands) + scroll-synced dots.
- `src/components/sections/EditorialGrid.tsx` — self-sorts by publish date, shows read-time.
- Deleted `src/lib/mockData.ts` (no longer used).

## Known follow-ups (intentionally not done)
- **Dynamic OG/social preview** (WhatsApp card with car image/price) needs SSR/prerender — a pure SPA can't do it. Skipped by request.
- **Configurator paint** is a visual tint; true per-colour shots need image assets per colour.
- **Site-wide Settings** (logo/SEO defaults) needs a backend `Settings` model — Settings tab currently shows the signed-in profile only.

## Deploy (summary)
**Backend**: set env (`DATABASE_URL`, `SUPABASE_JWT_SECRET`, `ALLOWED_ORIGINS`, `SEED_ADMIN_*`, Supabase storage keys), then:
```
npm ci
npx prisma generate
npx prisma migrate deploy
npm run seed          # first deploy only
npm start
```
**Frontend**: set `VITE_API_URL` to the backend URL, then `npm ci && npm run build` and serve `dist/` (SPA fallback to index.html).
