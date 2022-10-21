-- AlterTable
ALTER TABLE "ApiSchemaOperation" ADD COLUMN     "sortIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ApiSchemaPath" ADD COLUMN     "sortIndex" INTEGER NOT NULL DEFAULT 0;
