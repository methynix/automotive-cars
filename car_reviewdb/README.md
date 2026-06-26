# Car Review Backend

Express.js backend for the Car Review Platform using Supabase (Postgres + Storage + Auth).

Security notes:
- Use SUPABASE_SERVICE_ROLE_KEY only on server (.env). Keep it secret.
- Set ALLOWED_ORIGINS in .env to restrict CORS.

Quick start:

1. Copy .env.example to .env and fill values (SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, ALLOWED_ORIGINS)
2. npm install
3. npm run dev

API endpoints: see src/routes for route definitions.

Migrations:
- SQL migration is available at prisma/migrations/0001_init/migration.sql — run in Supabase SQL editor.

Testing:
- Use postman-guide.txt for Postman/Thunder Client test cases.

Notes on authentication and uploads:
- Admin endpoints require a valid Supabase JWT for a profile with role='admin'.
- Uploads are restricted to images under 5MB and require admin auth.
