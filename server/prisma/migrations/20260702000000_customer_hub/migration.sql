-- Customer hub: saved cars (virtual garage), test-drive appointments,
-- preference center, and linking inquiries (leads) to a customer profile.

-- Enums
DO $$ BEGIN
  CREATE TYPE "TestDriveStatus" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Leads: link an inquiry to the logged-in customer who submitted it
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "profile_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "idx_leads_profile_id" ON "leads"("profile_id");

-- Saved cars (virtual garage)
CREATE TABLE IF NOT EXISTS "saved_cars" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "review_id" UUID NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "saved_cars_profile_id_review_id_key" ON "saved_cars"("profile_id", "review_id");
CREATE INDEX IF NOT EXISTS "idx_saved_cars_profile_id" ON "saved_cars"("profile_id");

-- Test-drive appointments
CREATE TABLE IF NOT EXISTS "test_drives" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "review_id" UUID REFERENCES "reviews"("id") ON DELETE SET NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "preferred_date" TIMESTAMPTZ NOT NULL,
  "preferred_time" TEXT,
  "preferred_location" TEXT,
  "message" TEXT,
  "status" "TestDriveStatus" NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_test_drives_profile_id" ON "test_drives"("profile_id");
CREATE INDEX IF NOT EXISTS "idx_test_drives_status" ON "test_drives"("status");

-- Preference center (one row per customer)
CREATE TABLE IF NOT EXISTS "user_preferences" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" UUID NOT NULL UNIQUE REFERENCES "profiles"("id") ON DELETE CASCADE,
  "body_styles" TEXT[] NOT NULL DEFAULT '{}',
  "budget_min" INTEGER,
  "budget_max" INTEGER,
  "fuel_types" TEXT[] NOT NULL DEFAULT '{}',
  "notify_on_match" BOOLEAN NOT NULL DEFAULT false,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
