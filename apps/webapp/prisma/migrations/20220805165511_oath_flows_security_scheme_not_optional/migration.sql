/*
  Warnings:

  - A unique constraint covering the columns `[securitySchemeId,type]` on the table `ApiSchemaSecurityOAuthFlow` will be added. If there are existing duplicate values, this will fail.
  - Made the column `securitySchemeId` on table `ApiSchemaSecurityOAuthFlow` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ApiSchemaSecurityOAuthFlow" ALTER COLUMN "securitySchemeId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaSecurityOAuthFlow_securitySchemeId_type_key" ON "ApiSchemaSecurityOAuthFlow"("securitySchemeId", "type");
