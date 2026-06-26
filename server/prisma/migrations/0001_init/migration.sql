-- Prisma-style SQL migration for Car Review Platform
-- Run this in Supabase SQL editor or via psql connected to your Supabase DB

-- Ensure pgcrypto (for gen_random_uuid) is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum for review status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
    CREATE TYPE review_status AS ENUM ('draft', 'published');
  END IF;
END$$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  featured_image text,
  manufacturer text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  content jsonb NOT NULL,
  rating numeric,
  status review_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT fk_reviews_profiles FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE RESTRICT
);

-- Review specs
CREATE TABLE IF NOT EXISTS review_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL,
  engine text,
  horsepower integer,
  torque integer,
  transmission text,
  drivetrain text,
  fuel_type text,
  fuel_economy text,
  top_speed text,
  acceleration text,
  seating integer,
  price numeric,
  CONSTRAINT fk_review_specs_reviews FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Review gallery
CREATE TABLE IF NOT EXISTS review_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer,
  CONSTRAINT fk_review_gallery_reviews FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Optional: indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_published_at ON reviews(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_gallery_review_id ON review_gallery(review_id);
CREATE INDEX IF NOT EXISTS idx_review_specs_review_id ON review_specs(review_id);
