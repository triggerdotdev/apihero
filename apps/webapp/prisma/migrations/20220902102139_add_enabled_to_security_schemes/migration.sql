-- AlterTable
ALTER TABLE "ApiSchemaSecurityScheme" ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT;
