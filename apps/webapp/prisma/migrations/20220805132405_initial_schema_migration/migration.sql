-- CreateEnum
CREATE TYPE "APISchemaSecurityOAuthFlowType" AS ENUM ('IMPLICIT', 'PASSWORD', 'AUTHORIZATION_CODE', 'CLIENT_CREDENTIALS', 'DEVICE_CODE');

-- CreateEnum
CREATE TYPE "APISchemaSecuritySchemeLocation" AS ENUM ('QUERY', 'HEADER', 'COOKIE');

-- CreateEnum
CREATE TYPE "APISchemaSecuritySchemeType" AS ENUM ('APIKEY', 'HTTP', 'OAUTH2', 'OPENIDCONNECT', 'MUTUALTLS');

-- CreateEnum
CREATE TYPE "APISchemaParameterLocation" AS ENUM ('QUERY', 'HEADER', 'PATH', 'COOKIE');

-- CreateEnum
CREATE TYPE "APISchemaParameterStyle" AS ENUM ('SIMPLE', 'FORM', 'MATRIX');

-- AlterEnum
ALTER TYPE "HTTPMethod" ADD VALUE 'TRACE';

-- CreateTable
CREATE TABLE "APISchema" (
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

    CONSTRAINT "APISchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,
    "aPISchemaOperationId" TEXT,

    CONSTRAINT "APISchemaTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaServer" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,
    "aPISchemaPathId" TEXT,
    "aPISchemaOperationId" TEXT,

    CONSTRAINT "APISchemaServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaPath" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,
    "rawJson" JSONB NOT NULL,

    CONSTRAINT "APISchemaPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaOperation" (
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

    CONSTRAINT "APISchemaOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaSecurityRequirement" (
    "id" TEXT NOT NULL,
    "scopes" TEXT[],
    "securitySchemeId" TEXT NOT NULL,
    "operationId" TEXT,
    "schemaId" TEXT,

    CONSTRAINT "APISchemaSecurityRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaSecurityScheme" (
    "id" TEXT NOT NULL,
    "type" "APISchemaSecuritySchemeType" NOT NULL,
    "name" TEXT,
    "location" "APISchemaSecuritySchemeLocation",
    "httpScheme" TEXT,
    "bearerFormat" TEXT,
    "openIdConnectUrl" TEXT,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "APISchemaSecurityScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaSecurityOAuthFlow" (
    "id" TEXT NOT NULL,
    "type" "APISchemaSecurityOAuthFlowType" NOT NULL,
    "authorizationUrl" TEXT,
    "tokenUrl" TEXT,
    "refreshUrl" TEXT,
    "deviceAuthorizationUrl" TEXT,
    "securitySchemeId" TEXT,

    CONSTRAINT "APISchemaSecurityOAuthFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaSecurityScope" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "securitySchemeId" TEXT,

    CONSTRAINT "APISchemaSecurityScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaResponse" (
    "id" TEXT NOT NULL,
    "statusCode" TEXT NOT NULL,
    "description" TEXT,
    "operationId" TEXT NOT NULL,

    CONSTRAINT "APISchemaResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaResponseHeader" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ref" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "style" "APISchemaParameterStyle" NOT NULL DEFAULT E'SIMPLE',
    "explode" BOOLEAN NOT NULL DEFAULT false,
    "validationSchema" JSONB,
    "example" JSONB,
    "examples" JSONB,
    "aPISchemaResponseId" TEXT,

    CONSTRAINT "APISchemaResponseHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaRequestBody" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "operationId" TEXT NOT NULL,

    CONSTRAINT "APISchemaRequestBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaResponseBodyContent" (
    "id" TEXT NOT NULL,
    "mediaTypeRange" TEXT NOT NULL,
    "validationSchema" JSONB,
    "responseId" TEXT NOT NULL,
    "example" JSONB,
    "examples" JSONB,
    "encoding" JSONB,

    CONSTRAINT "APISchemaResponseBodyContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaRequestBodyContent" (
    "id" TEXT NOT NULL,
    "mediaTypeRange" TEXT NOT NULL,
    "validationSchema" JSONB,
    "requestBodyId" TEXT NOT NULL,
    "example" JSONB,
    "examples" JSONB,
    "encoding" JSONB,

    CONSTRAINT "APISchemaRequestBodyContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APISchemaParameter" (
    "id" TEXT NOT NULL,
    "ref" TEXT,
    "name" TEXT NOT NULL,
    "location" "APISchemaParameterLocation" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "allowEmptyValue" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "style" "APISchemaParameterStyle" NOT NULL DEFAULT E'SIMPLE',
    "explode" BOOLEAN NOT NULL DEFAULT false,
    "allowReserved" BOOLEAN NOT NULL DEFAULT false,
    "validationSchema" JSONB,
    "example" JSONB,
    "examples" JSONB,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "APISchemaParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_APISchemaOperationToAPISchemaParameter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_APISchemaParameterToAPISchemaPath" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "APISchemaPath_schemaId_path_key" ON "APISchemaPath"("schemaId", "path");

-- CreateIndex
CREATE UNIQUE INDEX "APISchemaOperation_pathId_method_key" ON "APISchemaOperation"("pathId", "method");

-- CreateIndex
CREATE UNIQUE INDEX "APISchemaOperation_schemaId_operationId_key" ON "APISchemaOperation"("schemaId", "operationId");

-- CreateIndex
CREATE UNIQUE INDEX "APISchemaRequestBody_operationId_key" ON "APISchemaRequestBody"("operationId");

-- CreateIndex
CREATE UNIQUE INDEX "_APISchemaOperationToAPISchemaParameter_AB_unique" ON "_APISchemaOperationToAPISchemaParameter"("A", "B");

-- CreateIndex
CREATE INDEX "_APISchemaOperationToAPISchemaParameter_B_index" ON "_APISchemaOperationToAPISchemaParameter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope_AB_unique" ON "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope"("A", "B");

-- CreateIndex
CREATE INDEX "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope_B_index" ON "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_APISchemaParameterToAPISchemaPath_AB_unique" ON "_APISchemaParameterToAPISchemaPath"("A", "B");

-- CreateIndex
CREATE INDEX "_APISchemaParameterToAPISchemaPath_B_index" ON "_APISchemaParameterToAPISchemaPath"("B");

-- AddForeignKey
ALTER TABLE "APISchemaTag" ADD CONSTRAINT "APISchemaTag_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "APISchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaTag" ADD CONSTRAINT "APISchemaTag_aPISchemaOperationId_fkey" FOREIGN KEY ("aPISchemaOperationId") REFERENCES "APISchemaOperation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaServer" ADD CONSTRAINT "APISchemaServer_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "APISchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaServer" ADD CONSTRAINT "APISchemaServer_aPISchemaPathId_fkey" FOREIGN KEY ("aPISchemaPathId") REFERENCES "APISchemaPath"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaServer" ADD CONSTRAINT "APISchemaServer_aPISchemaOperationId_fkey" FOREIGN KEY ("aPISchemaOperationId") REFERENCES "APISchemaOperation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaPath" ADD CONSTRAINT "APISchemaPath_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "APISchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaOperation" ADD CONSTRAINT "APISchemaOperation_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "APISchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaOperation" ADD CONSTRAINT "APISchemaOperation_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "APISchemaPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaSecurityRequirement" ADD CONSTRAINT "APISchemaSecurityRequirement_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "APISchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaSecurityRequirement" ADD CONSTRAINT "APISchemaSecurityRequirement_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "APISchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaSecurityRequirement" ADD CONSTRAINT "APISchemaSecurityRequirement_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "APISchemaSecurityScheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaSecurityScheme" ADD CONSTRAINT "APISchemaSecurityScheme_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "APISchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaSecurityOAuthFlow" ADD CONSTRAINT "APISchemaSecurityOAuthFlow_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "APISchemaSecurityScheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaSecurityScope" ADD CONSTRAINT "APISchemaSecurityScope_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "APISchemaSecurityScheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaResponse" ADD CONSTRAINT "APISchemaResponse_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "APISchemaOperation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaResponseHeader" ADD CONSTRAINT "APISchemaResponseHeader_aPISchemaResponseId_fkey" FOREIGN KEY ("aPISchemaResponseId") REFERENCES "APISchemaResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaRequestBody" ADD CONSTRAINT "APISchemaRequestBody_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "APISchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaResponseBodyContent" ADD CONSTRAINT "APISchemaResponseBodyContent_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "APISchemaResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaRequestBodyContent" ADD CONSTRAINT "APISchemaRequestBodyContent_requestBodyId_fkey" FOREIGN KEY ("requestBodyId") REFERENCES "APISchemaRequestBody"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APISchemaParameter" ADD CONSTRAINT "APISchemaParameter_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "APISchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_APISchemaOperationToAPISchemaParameter" ADD CONSTRAINT "_APISchemaOperationToAPISchemaParameter_A_fkey" FOREIGN KEY ("A") REFERENCES "APISchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_APISchemaOperationToAPISchemaParameter" ADD CONSTRAINT "_APISchemaOperationToAPISchemaParameter_B_fkey" FOREIGN KEY ("B") REFERENCES "APISchemaParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope" ADD CONSTRAINT "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope_A_fkey" FOREIGN KEY ("A") REFERENCES "APISchemaSecurityOAuthFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope" ADD CONSTRAINT "_APISchemaSecurityOAuthFlowToAPISchemaSecurityScope_B_fkey" FOREIGN KEY ("B") REFERENCES "APISchemaSecurityScope"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_APISchemaParameterToAPISchemaPath" ADD CONSTRAINT "_APISchemaParameterToAPISchemaPath_A_fkey" FOREIGN KEY ("A") REFERENCES "APISchemaParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_APISchemaParameterToAPISchemaPath" ADD CONSTRAINT "_APISchemaParameterToAPISchemaPath_B_fkey" FOREIGN KEY ("B") REFERENCES "APISchemaPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;
