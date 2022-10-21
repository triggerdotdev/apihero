/*
  Warnings:

  - A unique constraint covering the columns `[identifier,schemaId]` on the table `ApiSchemaSecurityScheme` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifier` to the `ApiSchemaSecurityScheme` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApiSchemaSecurityScheme" ADD COLUMN     "identifier" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaSecurityScheme_identifier_schemaId_key" ON "ApiSchemaSecurityScheme"("identifier", "schemaId");
