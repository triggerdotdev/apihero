-- AlterTable
ALTER TABLE "ApiSchemaRequestBodyContent" ADD COLUMN     "isArray" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ApiSchemaResponseBodyContent" ADD COLUMN     "isArray" BOOLEAN NOT NULL DEFAULT false;
