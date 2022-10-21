-- DropForeignKey
ALTER TABLE "ApiSchemaServer" DROP CONSTRAINT "ApiSchemaServer_operationId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaServer" DROP CONSTRAINT "ApiSchemaServer_pathId_fkey";

-- AddForeignKey
ALTER TABLE "ApiSchemaServer" ADD CONSTRAINT "ApiSchemaServer_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "ApiSchemaPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaServer" ADD CONSTRAINT "ApiSchemaServer_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
