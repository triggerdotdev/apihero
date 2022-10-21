/*
  Warnings:

  - You are about to drop the `APISchema` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaOperation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaParameter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaPath` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaRequestBody` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaRequestBodyContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaResponseBodyContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaResponseHeader` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaSecurityOAuthFlow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaSecurityRequirement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaSecurityScheme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaSecurityScope` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaServer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `APISchemaTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_APISchemaOperationToAPISchemaParameter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_APISchemaParameterToAPISchemaPath` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ApiSchemaSecurityOAuthFlowType" AS ENUM ('IMPLICIT', 'PASSWORD', 'AUTHORIZATION_CODE', 'CLIENT_CREDENTIALS', 'DEVICE_CODE');

-- CreateEnum
CREATE TYPE "ApiSchemaSecuritySchemeLocation" AS ENUM ('QUERY', 'HEADER', 'COOKIE');

-- CreateEnum
CREATE TYPE "ApiSchemaSecuritySchemeType" AS ENUM ('APIKEY', 'HTTP', 'OAUTH2', 'OPENIDCONNECT', 'MUTUALTLS');

-- CreateEnum
CREATE TYPE "ApiSchemaParameterLocation" AS ENUM ('QUERY', 'HEADER', 'PATH', 'COOKIE');

-- CreateEnum
CREATE TYPE "ApiSchemaParameterStyle" AS ENUM ('SIMPLE', 'FORM', 'MATRIX');

-- DropForeignKey
ALTER TABLE "APISchema" DROP CONSTRAINT "APISchema_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaOperation" DROP CONSTRAINT "APISchemaOperation_pathId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaOperation" DROP CONSTRAINT "APISchemaOperation_schemaId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaParameter" DROP CONSTRAINT "APISchemaParameter_schemaId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaPath" DROP CONSTRAINT "APISchemaPath_schemaId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaRequestBody" DROP CONSTRAINT "APISchemaRequestBody_operationId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaRequestBodyContent" DROP CONSTRAINT "APISchemaRequestBodyContent_requestBodyId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaResponse" DROP CONSTRAINT "APISchemaResponse_operationId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaResponseBodyContent" DROP CONSTRAINT "APISchemaResponseBodyContent_responseId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaResponseHeader" DROP CONSTRAINT "APISchemaResponseHeader_aPISchemaResponseId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaSecurityOAuthFlow" DROP CONSTRAINT "APISchemaSecurityOAuthFlow_securitySchemeId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaSecurityRequirement" DROP CONSTRAINT "APISchemaSecurityRequirement_operationId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaSecurityRequirement" DROP CONSTRAINT "APISchemaSecurityRequirement_schemaId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaSecurityRequirement" DROP CONSTRAINT "APISchemaSecurityRequirement_securitySchemeId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaSecurityScheme" DROP CONSTRAINT "APISchemaSecurityScheme_schemaId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaSecurityScope" DROP CONSTRAINT "APISchemaSecurityScope_securitySchemeId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaServer" DROP CONSTRAINT "APISchemaServer_aPISchemaOperationId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaServer" DROP CONSTRAINT "APISchemaServer_aPISchemaPathId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaServer" DROP CONSTRAINT "APISchemaServer_schemaId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaTag" DROP CONSTRAINT "APISchemaTag_aPISchemaOperationId_fkey";

-- DropForeignKey
ALTER TABLE "APISchemaTag" DROP CONSTRAINT "APISchemaTag_schemaId_fkey";

-- DropForeignKey
ALTER TABLE "_APISchemaOperationToAPISchemaParameter" DROP CONSTRAINT "_APISchemaOperationToAPISchemaParameter_A_fkey";

-- DropForeignKey
ALTER TABLE "_APISchemaOperationToAPISchemaParameter" DROP CONSTRAINT "_APISchemaOperationToAPISchemaParameter_B_fkey";

-- DropForeignKey
ALTER TABLE "_APISchemaParameterToAPISchemaPath" DROP CONSTRAINT "_APISchemaParameterToAPISchemaPath_A_fkey";

-- DropForeignKey
ALTER TABLE "_APISchemaParameterToAPISchemaPath" DROP CONSTRAINT "_APISchemaParameterToAPISchemaPath_B_fkey";

-- DropForeignKey
ALTER TABLE "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope" DROP CONSTRAINT "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope_A_fkey";

-- DropForeignKey
ALTER TABLE "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope" DROP CONSTRAINT "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope_B_fkey";

-- DropTable
DROP TABLE "APISchema";

-- DropTable
DROP TABLE "APISchemaOperation";

-- DropTable
DROP TABLE "APISchemaParameter";

-- DropTable
DROP TABLE "APISchemaPath";

-- DropTable
DROP TABLE "APISchemaRequestBody";

-- DropTable
DROP TABLE "APISchemaRequestBodyContent";

-- DropTable
DROP TABLE "APISchemaResponse";

-- DropTable
DROP TABLE "APISchemaResponseBodyContent";

-- DropTable
DROP TABLE "APISchemaResponseHeader";

-- DropTable
DROP TABLE "APISchemaSecurityOAuthFlow";

-- DropTable
DROP TABLE "APISchemaSecurityRequirement";

-- DropTable
DROP TABLE "APISchemaSecurityScheme";

-- DropTable
DROP TABLE "APISchemaSecurityScope";

-- DropTable
DROP TABLE "APISchemaServer";

-- DropTable
DROP TABLE "APISchemaTag";

-- DropTable
DROP TABLE "_APISchemaOperationToAPISchemaParameter";

-- DropTable
DROP TABLE "_APISchemaParameterToAPISchemaPath";

-- DropTable
DROP TABLE "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope";

-- DropEnum
DROP TYPE "APISchemaParameterLocation";

-- DropEnum
DROP TYPE "APISchemaParameterStyle";

-- DropEnum
DROP TYPE "APISchemaSecurityOAuthFlowType";

-- DropEnum
DROP TYPE "APISchemaSecuritySchemeLocation";

-- DropEnum
DROP TYPE "APISchemaSecuritySchemeType";

-- CreateTable
CREATE TABLE "ApiSchema" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "openApiVersion" TEXT NOT NULL,
    "description" TEXT,
    "termsOfService" TEXT,
    "license" TEXT,
    "contact" TEXT,
    "jsonSchemaDialect" TEXT,
    "securityOptional" BOOLEAN NOT NULL DEFAULT false,
    "externalDocsUrl" TEXT,
    "externalDocsDescription" TEXT,
    "integrationId" TEXT NOT NULL,

    CONSTRAINT "ApiSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,
    "operationId" TEXT,

    CONSTRAINT "ApiSchemaTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaServer" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,
    "pathId" TEXT,
    "operationId" TEXT,

    CONSTRAINT "ApiSchemaServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaPath" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,
    "rawJson" JSONB NOT NULL,

    CONSTRAINT "ApiSchemaPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaOperation" (
    "id" TEXT NOT NULL,
    "method" "HTTPMethod" NOT NULL DEFAULT E'GET',
    "operationId" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "externalDocsUrl" TEXT,
    "externalDocsDescription" TEXT,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "securityOptional" BOOLEAN NOT NULL DEFAULT false,
    "pathId" TEXT NOT NULL,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaSecurityRequirement" (
    "id" TEXT NOT NULL,
    "scopes" TEXT[],
    "securitySchemeId" TEXT NOT NULL,
    "operationId" TEXT,
    "schemaId" TEXT,

    CONSTRAINT "ApiSchemaSecurityRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaSecurityScheme" (
    "id" TEXT NOT NULL,
    "type" "ApiSchemaSecuritySchemeType" NOT NULL,
    "name" TEXT,
    "location" "ApiSchemaSecuritySchemeLocation",
    "httpScheme" TEXT,
    "bearerFormat" TEXT,
    "openIdConnectUrl" TEXT,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaSecurityScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaSecurityOAuthFlow" (
    "id" TEXT NOT NULL,
    "type" "ApiSchemaSecurityOAuthFlowType" NOT NULL,
    "authorizationUrl" TEXT,
    "tokenUrl" TEXT,
    "refreshUrl" TEXT,
    "deviceAuthorizationUrl" TEXT,
    "securitySchemeId" TEXT,

    CONSTRAINT "ApiSchemaSecurityOAuthFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaSecurityScope" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "securitySchemeId" TEXT,

    CONSTRAINT "ApiSchemaSecurityScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaResponse" (
    "id" TEXT NOT NULL,
    "statusCode" TEXT NOT NULL,
    "description" TEXT,
    "operationId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaResponseHeader" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ref" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "style" "ApiSchemaParameterStyle" NOT NULL DEFAULT E'SIMPLE',
    "explode" BOOLEAN NOT NULL DEFAULT false,
    "validationSchema" JSONB,
    "example" JSONB,
    "examples" JSONB,
    "responseId" TEXT,

    CONSTRAINT "ApiSchemaResponseHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaRequestBody" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "operationId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaRequestBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaResponseBodyContent" (
    "id" TEXT NOT NULL,
    "mediaTypeRange" TEXT NOT NULL,
    "validationSchema" JSONB,
    "responseId" TEXT NOT NULL,
    "example" JSONB,
    "examples" JSONB,
    "encoding" JSONB,

    CONSTRAINT "ApiSchemaResponseBodyContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaRequestBodyContent" (
    "id" TEXT NOT NULL,
    "mediaTypeRange" TEXT NOT NULL,
    "validationSchema" JSONB,
    "requestBodyId" TEXT NOT NULL,
    "example" JSONB,
    "examples" JSONB,
    "encoding" JSONB,

    CONSTRAINT "ApiSchemaRequestBodyContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaParameter" (
    "id" TEXT NOT NULL,
    "ref" TEXT,
    "name" TEXT NOT NULL,
    "location" "ApiSchemaParameterLocation" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "allowEmptyValue" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "style" "ApiSchemaParameterStyle" NOT NULL DEFAULT E'SIMPLE',
    "explode" BOOLEAN NOT NULL DEFAULT false,
    "allowReserved" BOOLEAN NOT NULL DEFAULT false,
    "validationSchema" JSONB,
    "example" JSONB,
    "examples" JSONB,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApiSchemaOperationToApiSchemaParameter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaParameterToApiSchemaPath" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaPath_schemaId_path_key" ON "ApiSchemaPath"("schemaId", "path");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaOperation_pathId_method_key" ON "ApiSchemaOperation"("pathId", "method");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaOperation_schemaId_operationId_key" ON "ApiSchemaOperation"("schemaId", "operationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaRequestBody_operationId_key" ON "ApiSchemaRequestBody"("operationId");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaOperationToApiSchemaParameter_AB_unique" ON "_ApiSchemaOperationToApiSchemaParameter"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaOperationToApiSchemaParameter_B_index" ON "_ApiSchemaOperationToApiSchemaParameter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope_AB_unique" ON "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope_B_index" ON "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaParameterToApiSchemaPath_AB_unique" ON "_ApiSchemaParameterToApiSchemaPath"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaParameterToApiSchemaPath_B_index" ON "_ApiSchemaParameterToApiSchemaPath"("B");

-- AddForeignKey
ALTER TABLE "ApiSchema" ADD CONSTRAINT "ApiSchema_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaTag" ADD CONSTRAINT "ApiSchemaTag_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaTag" ADD CONSTRAINT "ApiSchemaTag_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaServer" ADD CONSTRAINT "ApiSchemaServer_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaServer" ADD CONSTRAINT "ApiSchemaServer_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "ApiSchemaPath"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaServer" ADD CONSTRAINT "ApiSchemaServer_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaPath" ADD CONSTRAINT "ApiSchemaPath_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaOperation" ADD CONSTRAINT "ApiSchemaOperation_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaOperation" ADD CONSTRAINT "ApiSchemaOperation_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "ApiSchemaPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityRequirement" ADD CONSTRAINT "ApiSchemaSecurityRequirement_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityRequirement" ADD CONSTRAINT "ApiSchemaSecurityRequirement_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityRequirement" ADD CONSTRAINT "ApiSchemaSecurityRequirement_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "ApiSchemaSecurityScheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityScheme" ADD CONSTRAINT "ApiSchemaSecurityScheme_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityOAuthFlow" ADD CONSTRAINT "ApiSchemaSecurityOAuthFlow_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "ApiSchemaSecurityScheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityScope" ADD CONSTRAINT "ApiSchemaSecurityScope_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "ApiSchemaSecurityScheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponse" ADD CONSTRAINT "ApiSchemaResponse_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseHeader" ADD CONSTRAINT "ApiSchemaResponseHeader_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ApiSchemaResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaRequestBody" ADD CONSTRAINT "ApiSchemaRequestBody_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseBodyContent" ADD CONSTRAINT "ApiSchemaResponseBodyContent_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ApiSchemaResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaRequestBodyContent" ADD CONSTRAINT "ApiSchemaRequestBodyContent_requestBodyId_fkey" FOREIGN KEY ("requestBodyId") REFERENCES "ApiSchemaRequestBody"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaParameter" ADD CONSTRAINT "ApiSchemaParameter_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaParameter" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaParameter_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaParameter" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaParameter_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope" ADD CONSTRAINT "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaSecurityOAuthFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope" ADD CONSTRAINT "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaSecurityScope"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaParameterToApiSchemaPath" ADD CONSTRAINT "_ApiSchemaParameterToApiSchemaPath_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaParameterToApiSchemaPath" ADD CONSTRAINT "_ApiSchemaParameterToApiSchemaPath_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;
