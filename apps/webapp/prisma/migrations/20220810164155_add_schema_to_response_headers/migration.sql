/*
  Warnings:

  - Added the required column `schemaId` to the `ApiSchemaResponseHeader` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApiSchemaResponseHeader" ADD COLUMN     "schemaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseHeader" ADD CONSTRAINT "ApiSchemaResponseHeader_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
