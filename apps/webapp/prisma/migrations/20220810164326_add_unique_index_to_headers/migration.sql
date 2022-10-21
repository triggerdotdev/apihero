/*
  Warnings:

  - A unique constraint covering the columns `[ref,schemaId]` on the table `ApiSchemaResponseHeader` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaResponseHeader_ref_schemaId_key" ON "ApiSchemaResponseHeader"("ref", "schemaId");
