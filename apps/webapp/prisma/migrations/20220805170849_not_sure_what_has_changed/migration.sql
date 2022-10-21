/*
  Warnings:

  - A unique constraint covering the columns `[name,securitySchemeId]` on the table `ApiSchemaSecurityScope` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaSecurityScope_name_securitySchemeId_key" ON "ApiSchemaSecurityScope"("name", "securitySchemeId");
