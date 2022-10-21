-- DropForeignKey
ALTER TABLE "ApiSchemaChange" DROP CONSTRAINT "ApiSchemaChange_schemaId_fkey";

-- AddForeignKey
ALTER TABLE "ApiSchemaChange" ADD CONSTRAINT "ApiSchemaChange_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
