-- AlterTable
ALTER TABLE "ApiSchemaParameter" ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "ApiSchemaRequestBody" ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "ApiSchemaResponseBody" ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "ApiSchemaResponseHeader" ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "ApiSchemaSecurityScheme" ADD COLUMN     "summary" TEXT;
