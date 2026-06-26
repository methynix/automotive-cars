# Future Automotive — Deployment & Fix Notes

Two services:
- `car_reviewdb` — Express + Prisma (PostgreSQL/Supabase) API
- `car_review_front` — Vite + React + TypeScript + Tailwind SPA

---

## 1. What was broken and fixed

### Critical (blocked deployment)
1. **`prisma/seed.js` was corrupted** — two seed files were concatenated, producing a hard
   `SyntaxError`. Rewritten as one valid file (Chinese-EV dataset, 0–10 ratings, bcrypt admin
   with email + password, sample comments). Admin creds come from `SEED_ADMIN_EMAIL` /
   `SEED_ADMIN_PASSWORD`.
2. **Schema/migration drift on `profiles`** — migrations created `profiles` WITHOUT the
   `email` / `password_hash` columns the schema and auth code require, and no migration ever
   added them. A fresh `prisma migrate deploy` produced a DB where every login/register/admin
   call failed at the SQL layer. Added migration `20260615000000_add_profile_auth`.
3. **Rating scale mismatch** — validator allowed 0–5, but the frontend renders “/ 10” and one
   seed used 0–10. Standardized on **0–10**: validator max is now 10; seed data is 0–10.

### Security
4. **Hardcoded JWT fallback secret removed.** `auth.routes.js` used to fall back to a known
   string when `SUPABASE_JWT_SECRET` was missing — anyone could forge admin tokens. It now
   throws if the secret is missing and rejects weak secrets in production.
5. **Token lifetime** reduced from `365d` to a configurable `JWT_EXPIRES_IN` (default `7d`).
6. **`trust proxy`** enabled so rate-limiting sees real client IPs behind Render’s proxy.
7. **CORS** logs a warning if `ALLOWED_ORIGINS` is empty in production (it otherwise allows all).
8. **Swagger `/api-docs`** can be disabled with `ENABLE_DOCS=false`.
9. **Supabase client is now lazy** — a missing Supabase config no longer crashes the whole
   server at boot; only the image-upload endpoint errors (503).
10. **UUID validation** added to public comment routes (`/api/reviews/:id/comments`) so malformed
    IDs return 400 instead of a 500.

### Data/logic
11. `published_at` is now stamped when a review is created/updated as `published` (the public
    list orders by `published_at desc`, so this matters for ordering/visibility).
12. Removed redundant duplicate `include` keys in the review service.

### Frontend / UI
13. **Price filter floor bug** — the listings page hard-coded a `$50,000` minimum that the UI
    could never lower, permanently hiding cheaper cars. Default is now `$0`.
14. **Drivetrain filter** never matched (`"All-Wheel Drive"` vs `"AWD"`). Added normalization.
15. **Removed two dead filters** (Body Style, Key Features) that had no backing data and did
    nothing when clicked.
16. **Category tiles** on the homepage linked to a search that returned nothing; they now open
    the full listings page.
17. **Brand name consistency** — the footer said “AUTOELITE”; changed to “FUTURE AUTOMOTIVE”.
18. **Hero video** now has a `poster` + `preload="metadata"` so it degrades gracefully (the
    bundled 35 MB AV1 file does not play in Safari/iOS).
19. Newsletter “WhatsApp” button no longer injects a fake email; it’s a real outbound link.

---

## 2. Deploy the backend (`car_reviewdb`)

Required env (see `.env.example`):
- `DATABASE_URL` — Postgres/Supabase connection string
- `SUPABASE_JWT_SECRET` — **strong** random string (≥32 chars). Generate: `openssl rand -hex 32`
- `ALLOWED_ORIGINS` — your frontend URL(s), comma-separated
- `NODE_ENV=production`
- (optional) `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` — only for uploads
- (optional) `JWT_EXPIRES_IN`, `ENABLE_DOCS`, `RATE_LIMIT_*`

Steps:
```bash
npm ci
npx prisma generate
npx prisma migrate deploy     # applies all migrations incl. the auth-columns fix
npm run seed                  # optional: creates admin + sample data
npm start
```

> Migration history note: this repo contains legacy hand-written migrations
> (`0001_init`, `0002_add_features`) plus a Prisma-generated `20260614103307_init`
> and the new `20260615000000_add_profile_auth`. `migrate deploy` applies pending ones
> in order and works for a fresh DB. If you ever see drift on an existing DB, the clean
> path is `npx prisma migrate reset` (DESTRUCTIVE) on a throwaway DB, or regenerate a
> single squashed migration from `schema.prisma` with `prisma migrate diff`.

After seeding, the default admin is `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — **change these**.

## 3. Deploy the frontend (`car_review_front`)

Env:
- `VITE_API_URL` — your deployed backend URL (e.g. `https://your-api.onrender.com`)

Steps:
```bash
npm ci
npm run build        # tsc + vite build -> dist/
# serve dist/ on Netlify/Vercel/static host. Add a SPA fallback to index.html.
```

The hero expects the video file in `public/` (kept out of this archive to reduce size).
Either keep your original file at the same path or replace the `<video src>` in
`src/components/sections/Hero.tsx`. For production, compress it and add an H.264 source.

SPA routing: configure your host to rewrite all paths to `/index.html`
(Netlify `_redirects`: `/*  /index.html  200`).

---

## 4. Recommended next (not blockers)

- Add email verification / password reset to auth.
- Add a `category` / `body_type` field to reviews if you want real segment filtering.
- The Compare page always loads the first two featured reviews; let users pick vehicles.
- Add a proper test suite (only a health test exists) and CI.
