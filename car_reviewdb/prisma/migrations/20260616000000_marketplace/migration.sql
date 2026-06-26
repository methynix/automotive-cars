-- Marketplace expansion: body style, condition, mileage, 1:1 specs, brands, leads, user status.

-- Enums
DO $$ BEGIN
  CREATE TYPE "Condition" AS ENUM ('new', 'used', 'certified');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'qualified', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Profiles: account status (active/suspended)
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';

-- Reviews: body style + condition
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "body_style" TEXT;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "condition" "Condition" NOT NULL DEFAULT 'used';
CREATE INDEX IF NOT EXISTS "idx_reviews_body_style" ON "reviews"("body_style");
CREATE INDEX IF NOT EXISTS "idx_reviews_condition" ON "reviews"("condition");

-- Specs: mileage + enforce one-to-one (one spec row per review)
ALTER TABLE "review_specs" ADD COLUMN IF NOT EXISTS "mileage" INTEGER;
-- If any review accidentally has >1 spec row, keep the first and delete extras
DELETE FROM "review_specs" a USING "review_specs" b
  WHERE a.ctid < b.ctid AND a.review_id = b.review_id;
CREATE UNIQUE INDEX IF NOT EXISTS "review_specs_review_id_key" ON "review_specs"("review_id");

-- Brands
CREATE TABLE IF NOT EXISTS "brands" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "country" TEXT,
  "founded_year" INTEGER,
  "logo_url" TEXT,
  "description" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leads (test-drive / inquiry requests)
CREATE TABLE IF NOT EXISTS "leads" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "review_id" UUID REFERENCES "reviews"("id") ON DELETE SET NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "message" TEXT,
  "preferred_location" TEXT,
  "status" "LeadStatus" NOT NULL DEFAULT 'new',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_leads_status" ON "leads"("status");
CREATE INDEX IF NOT EXISTS "idx_leads_review_id" ON "leads"("review_id");
