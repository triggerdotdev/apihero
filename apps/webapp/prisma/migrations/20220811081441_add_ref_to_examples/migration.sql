/*
  Warnings:

  - A unique constraint covering the columns `[ref,schemaId]` on the table `ApiSchemaExample` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ApiSchemaExample" ADD COLUMN     "ref" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaExample_ref_schemaId_key" ON "ApiSchemaExample"("ref", "schemaId");
