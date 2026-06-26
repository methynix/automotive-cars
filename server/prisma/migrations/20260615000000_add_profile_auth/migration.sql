-- Fixes critical schema drift: the `profiles` table was originally created
-- without the `email` / `password_hash` columns that the Prisma schema and
-- the auth code require. Without this, every login/register/admin call fails
-- at the SQL layer. This migration brings any existing DB up to the schema.

-- Add columns as nullable first so it is safe on a table that already has rows.
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;

-- Backfill any pre-existing rows so the NOT NULL constraints can be applied.
UPDATE "profiles" SET "email" = "id" || '@placeholder.local' WHERE "email" IS NULL;
UPDATE "profiles" SET "password_hash" = '!disabled' WHERE "password_hash" IS NULL;

-- Enforce the schema constraints.
ALTER TABLE "profiles" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "profiles" ALTER COLUMN "password_hash" SET NOT NULL;

-- Unique index on email (matches @unique in schema).
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_email_key" ON "profiles"("email");

-- role defaults to 'user' in the schema.
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'user';
