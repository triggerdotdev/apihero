/*
  Warnings:

  - A unique constraint covering the columns `[name,schemaId]` on the table `ApiSchemaTag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaTag_name_schemaId_key" ON "ApiSchemaTag"("name", "schemaId");
