-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "name" TEXT,
ADD COLUMN     "officialDocumentation" TEXT;

UPDATE "Integration" SET "name" = slug;
ALTER TABLE "Integration" ALTER COLUMN     "name" SET NOT NULL;