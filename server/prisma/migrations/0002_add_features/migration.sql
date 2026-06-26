-- Add new columns to `reviews` table
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ;

-- Create `comments` table
CREATE TABLE IF NOT EXISTS "comments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "review_id" UUID NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE,
  "author_name" TEXT NOT NULL,
  "author_email" TEXT,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_by" UUID REFERENCES "profiles"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_comments_review_id ON "comments"("review_id");
CREATE INDEX IF NOT EXISTS idx_comments_status ON "comments"("status");
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON "reviews"("deleted_at");
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON "reviews"("featured");
