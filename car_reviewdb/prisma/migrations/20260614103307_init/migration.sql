/*
  Warnings:

  - The `status` column on the `comments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `price` on the `review_specs` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `DoublePrecision`.
  - You are about to alter the column `rating` on the `reviews` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `DoublePrecision`.
  - The `status` column on the `reviews` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('approved', 'pending', 'spam');

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_created_by_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_review_id_fkey";

-- DropForeignKey
ALTER TABLE "review_gallery" DROP CONSTRAINT "fk_review_gallery_reviews";

-- DropForeignKey
ALTER TABLE "review_specs" DROP CONSTRAINT "fk_review_specs_reviews";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "fk_reviews_profiles";

-- DropIndex
DROP INDEX "idx_comments_review_id";

-- DropIndex
DROP INDEX "idx_comments_status";

-- DropIndex
DROP INDEX "idx_review_gallery_review_id";

-- DropIndex
DROP INDEX "idx_review_specs_review_id";

-- DropIndex
DROP INDEX "idx_reviews_created_at";

-- DropIndex
DROP INDEX "idx_reviews_deleted_at";

-- DropIndex
DROP INDEX "idx_reviews_featured";

-- DropIndex
DROP INDEX "idx_reviews_published_at";

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "id" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" "CommentStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "review_gallery" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "review_specs" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "status",
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'draft',
ALTER COLUMN "published_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3);

-- DropEnum
DROP TYPE "review_status";

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_specs" ADD CONSTRAINT "review_specs_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_gallery" ADD CONSTRAINT "review_gallery_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
