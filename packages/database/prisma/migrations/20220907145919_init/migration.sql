-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateEnum
CREATE TYPE "HTTPMethod" AS ENUM ('GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE', 'TRACE');

-- CreateEnum
CREATE TYPE "AuthenticationMethod" AS ENUM ('GITHUB', 'MAGIC_LINK');

-- CreateEnum
CREATE TYPE "ApiSchemaSecurityOAuthFlowType" AS ENUM ('IMPLICIT', 'PASSWORD', 'AUTHORIZATION_CODE', 'CLIENT_CREDENTIALS', 'DEVICE_CODE');

-- CreateEnum
CREATE TYPE "ApiSchemaSecuritySchemeLocation" AS ENUM ('QUERY', 'HEADER', 'COOKIE');

-- CreateEnum
CREATE TYPE "ApiSchemaSecuritySchemeType" AS ENUM ('APIKEY', 'HTTP', 'OAUTH2', 'OPENIDCONNECT', 'MUTUALTLS');

-- CreateEnum
CREATE TYPE "ApiSchemaParameterLocation" AS ENUM ('QUERY', 'HEADER', 'PATH', 'COOKIE');

-- CreateEnum
CREATE TYPE "ApiSchemaParameterStyle" AS ENUM ('SIMPLE', 'FORM', 'MATRIX', 'LABEL', 'SPACE_DELIMITED', 'PIPE_DELIMITED', 'DEEP_OBJECT');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "authenticationExtraParams" JSONB,
ADD COLUMN     "authenticationMethod" "AuthenticationMethod" NOT NULL,
ADD COLUMN     "authenticationProfile" JSONB,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "RequestToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "RequestToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "requestTokenId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HttpClient" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cacheEnabled" BOOLEAN NOT NULL DEFAULT false,
    "cacheTtl" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HttpClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HttpClientAuthentication" (
    "id" TEXT NOT NULL,
    "httpClientId" TEXT NOT NULL,
    "securitySchemeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authenticationData" JSONB,
    "username" TEXT,
    "password" TEXT,

    CONSTRAINT "HttpClientAuthentication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HttpEndpoint" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cacheEnabled" BOOLEAN NOT NULL DEFAULT false,
    "cacheTtl" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HttpEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HttpRequestLog" (
    "id" TEXT NOT NULL,
    "method" "HTTPMethod" NOT NULL DEFAULT 'GET',
    "statusCode" INTEGER NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "search" TEXT NOT NULL DEFAULT '',
    "requestBody" JSONB,
    "requestHeaders" JSONB,
    "responseBody" JSONB,
    "responseHeaders" JSONB,
    "params" JSONB,
    "mappings" JSONB,
    "isCacheHit" BOOLEAN NOT NULL,
    "responseSize" INTEGER NOT NULL DEFAULT 0,
    "requestDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gatewayDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endpointId" TEXT NOT NULL,
    "clientAuthenticationId" TEXT,

    CONSTRAINT "HttpRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "officialDocumentation" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slug" TEXT NOT NULL,
    "authorNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoImage" TEXT,
    "currentSchemaId" TEXT,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isPrerelease" BOOLEAN NOT NULL DEFAULT false,
    "integrationId" TEXT NOT NULL,
    "schemaId" TEXT NOT NULL,
    "commit" JSONB,
    "tagRef" JSONB,
    "gitRef" JSONB,
    "releaseData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

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
    "rawData" JSONB NOT NULL,

    CONSTRAINT "ApiSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaChange" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rawData" JSONB NOT NULL,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaServer" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "schemaId" TEXT,
    "pathId" TEXT,
    "operationId" TEXT,

    CONSTRAINT "ApiSchemaServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaPath" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,
    "rawJson" JSONB NOT NULL,

    CONSTRAINT "ApiSchemaPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaOperation" (
    "id" TEXT NOT NULL,
    "method" "HTTPMethod" NOT NULL DEFAULT 'GET',
    "operationId" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "description" TEXT,
    "externalDocsUrl" TEXT,
    "externalDocsDescription" TEXT,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "requestBodyId" TEXT,
    "securityOptional" BOOLEAN NOT NULL DEFAULT false,
    "extensions" JSONB,
    "mappings" JSONB,
    "pathId" TEXT NOT NULL,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaSecurityRequirement" (
    "id" TEXT NOT NULL,
    "securitySchemeId" TEXT NOT NULL,
    "operationId" TEXT,
    "schemaId" TEXT,

    CONSTRAINT "ApiSchemaSecurityRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaSecurityScheme" (
    "id" TEXT NOT NULL,
    "type" "ApiSchemaSecuritySchemeType" NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT,
    "location" "ApiSchemaSecuritySchemeLocation",
    "httpScheme" TEXT,
    "bearerFormat" TEXT,
    "openIdConnectUrl" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,
    "title" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

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
    "securitySchemeId" TEXT NOT NULL,

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
CREATE TABLE "ApiSchemaResponseBody" (
    "id" TEXT NOT NULL,
    "ref" TEXT,
    "statusCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaResponseBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaResponseBodyContent" (
    "id" TEXT NOT NULL,
    "mediaTypeRange" TEXT NOT NULL,
    "validationSchema" JSONB,
    "responseBodyId" TEXT NOT NULL,
    "example" JSONB,
    "encoding" JSONB,

    CONSTRAINT "ApiSchemaResponseBodyContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaResponseHeader" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "summary" TEXT,
    "ref" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "style" "ApiSchemaParameterStyle" NOT NULL DEFAULT 'SIMPLE',
    "explode" BOOLEAN NOT NULL DEFAULT false,
    "validationSchema" JSONB,
    "example" JSONB,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaResponseHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaRequestBody" (
    "id" TEXT NOT NULL,
    "ref" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaRequestBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaRequestBodyContent" (
    "id" TEXT NOT NULL,
    "mediaTypeRange" TEXT NOT NULL,
    "validationSchema" JSONB,
    "requestBodyId" TEXT NOT NULL,
    "example" JSONB,
    "encoding" JSONB,

    CONSTRAINT "ApiSchemaRequestBodyContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaExample" (
    "id" TEXT NOT NULL,
    "ref" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "value" JSONB,
    "externalValue" TEXT,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchemaModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contents" JSONB NOT NULL,
    "example" JSONB,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaModel_pkey" PRIMARY KEY ("id")
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
    "summary" TEXT,
    "description" TEXT,
    "style" "ApiSchemaParameterStyle" NOT NULL DEFAULT 'SIMPLE',
    "explode" BOOLEAN NOT NULL DEFAULT false,
    "allowReserved" BOOLEAN NOT NULL DEFAULT false,
    "validationSchema" JSONB,
    "example" JSONB,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToWorkspace" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaOperationToApiSchemaTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaOperationToApiSchemaParameter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaOperationToApiSchemaResponseBody" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaResponseBodyToApiSchemaResponseHeader" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaExampleToApiSchemaParameter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaExampleToApiSchemaResponseHeader" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaExampleToApiSchemaResponseBodyContent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaExampleToApiSchemaRequestBodyContent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaParameterToApiSchemaPath" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestToken_token_key" ON "RequestToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_token_key" ON "AuthToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_requestTokenId_key" ON "AuthToken"("requestTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_workspaceId_slug_key" ON "Project"("workspaceId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "HttpClient_projectId_integrationId_key" ON "HttpClient"("projectId", "integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "HttpClientAuthentication_httpClientId_securitySchemeId_key" ON "HttpClientAuthentication"("httpClientId", "securitySchemeId");

-- CreateIndex
CREATE UNIQUE INDEX "HttpEndpoint_clientId_operationId_key" ON "HttpEndpoint"("clientId", "operationId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_slug_key" ON "Integration"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaTag_name_schemaId_key" ON "ApiSchemaTag"("name", "schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaPath_schemaId_path_key" ON "ApiSchemaPath"("schemaId", "path");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaOperation_pathId_method_key" ON "ApiSchemaOperation"("pathId", "method");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaOperation_schemaId_operationId_key" ON "ApiSchemaOperation"("schemaId", "operationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaSecurityScheme_identifier_schemaId_key" ON "ApiSchemaSecurityScheme"("identifier", "schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaSecurityOAuthFlow_securitySchemeId_type_key" ON "ApiSchemaSecurityOAuthFlow"("securitySchemeId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaSecurityScope_name_securitySchemeId_key" ON "ApiSchemaSecurityScope"("name", "securitySchemeId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaResponseBody_ref_schemaId_key" ON "ApiSchemaResponseBody"("ref", "schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaResponseHeader_ref_schemaId_key" ON "ApiSchemaResponseHeader"("ref", "schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaRequestBody_ref_schemaId_key" ON "ApiSchemaRequestBody"("ref", "schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaExample_ref_schemaId_key" ON "ApiSchemaExample"("ref", "schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaModel_name_schemaId_key" ON "ApiSchemaModel"("name", "schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaParameter_ref_schemaId_key" ON "ApiSchemaParameter"("ref", "schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToWorkspace_AB_unique" ON "_UserToWorkspace"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToWorkspace_B_index" ON "_UserToWorkspace"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaOperationToApiSchemaTag_AB_unique" ON "_ApiSchemaOperationToApiSchemaTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaOperationToApiSchemaTag_B_index" ON "_ApiSchemaOperationToApiSchemaTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaOperationToApiSchemaParameter_AB_unique" ON "_ApiSchemaOperationToApiSchemaParameter"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaOperationToApiSchemaParameter_B_index" ON "_ApiSchemaOperationToApiSchemaParameter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaOperationToApiSchemaResponseBody_AB_unique" ON "_ApiSchemaOperationToApiSchemaResponseBody"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaOperationToApiSchemaResponseBody_B_index" ON "_ApiSchemaOperationToApiSchemaResponseBody"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope_AB_unique" ON "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope_B_index" ON "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope_AB_unique" ON "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope_B_index" ON "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaResponseBodyToApiSchemaResponseHeader_AB_unique" ON "_ApiSchemaResponseBodyToApiSchemaResponseHeader"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaResponseBodyToApiSchemaResponseHeader_B_index" ON "_ApiSchemaResponseBodyToApiSchemaResponseHeader"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaExampleToApiSchemaParameter_AB_unique" ON "_ApiSchemaExampleToApiSchemaParameter"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaExampleToApiSchemaParameter_B_index" ON "_ApiSchemaExampleToApiSchemaParameter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaExampleToApiSchemaResponseHeader_AB_unique" ON "_ApiSchemaExampleToApiSchemaResponseHeader"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaExampleToApiSchemaResponseHeader_B_index" ON "_ApiSchemaExampleToApiSchemaResponseHeader"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaExampleToApiSchemaResponseBodyContent_AB_unique" ON "_ApiSchemaExampleToApiSchemaResponseBodyContent"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaExampleToApiSchemaResponseBodyContent_B_index" ON "_ApiSchemaExampleToApiSchemaResponseBodyContent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaExampleToApiSchemaRequestBodyContent_AB_unique" ON "_ApiSchemaExampleToApiSchemaRequestBodyContent"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaExampleToApiSchemaRequestBodyContent_B_index" ON "_ApiSchemaExampleToApiSchemaRequestBodyContent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaParameterToApiSchemaPath_AB_unique" ON "_ApiSchemaParameterToApiSchemaPath"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaParameterToApiSchemaPath_B_index" ON "_ApiSchemaParameterToApiSchemaPath"("B");

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_requestTokenId_fkey" FOREIGN KEY ("requestTokenId") REFERENCES "RequestToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpClient" ADD CONSTRAINT "HttpClient_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpClient" ADD CONSTRAINT "HttpClient_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpClientAuthentication" ADD CONSTRAINT "HttpClientAuthentication_httpClientId_fkey" FOREIGN KEY ("httpClientId") REFERENCES "HttpClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpClientAuthentication" ADD CONSTRAINT "HttpClientAuthentication_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "ApiSchemaSecurityScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpEndpoint" ADD CONSTRAINT "HttpEndpoint_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "HttpClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpEndpoint" ADD CONSTRAINT "HttpEndpoint_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpRequestLog" ADD CONSTRAINT "HttpRequestLog_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "HttpEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpRequestLog" ADD CONSTRAINT "HttpRequestLog_clientAuthenticationId_fkey" FOREIGN KEY ("clientAuthenticationId") REFERENCES "HttpClientAuthentication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_currentSchemaId_fkey" FOREIGN KEY ("currentSchemaId") REFERENCES "ApiSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchema" ADD CONSTRAINT "ApiSchema_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaChange" ADD CONSTRAINT "ApiSchemaChange_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaTag" ADD CONSTRAINT "ApiSchemaTag_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaServer" ADD CONSTRAINT "ApiSchemaServer_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaServer" ADD CONSTRAINT "ApiSchemaServer_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "ApiSchemaPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaServer" ADD CONSTRAINT "ApiSchemaServer_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaPath" ADD CONSTRAINT "ApiSchemaPath_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaOperation" ADD CONSTRAINT "ApiSchemaOperation_requestBodyId_fkey" FOREIGN KEY ("requestBodyId") REFERENCES "ApiSchemaRequestBody"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaOperation" ADD CONSTRAINT "ApiSchemaOperation_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "ApiSchemaPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaOperation" ADD CONSTRAINT "ApiSchemaOperation_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityRequirement" ADD CONSTRAINT "ApiSchemaSecurityRequirement_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "ApiSchemaSecurityScheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityRequirement" ADD CONSTRAINT "ApiSchemaSecurityRequirement_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityRequirement" ADD CONSTRAINT "ApiSchemaSecurityRequirement_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityScheme" ADD CONSTRAINT "ApiSchemaSecurityScheme_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityOAuthFlow" ADD CONSTRAINT "ApiSchemaSecurityOAuthFlow_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "ApiSchemaSecurityScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityScope" ADD CONSTRAINT "ApiSchemaSecurityScope_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "ApiSchemaSecurityScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseBody" ADD CONSTRAINT "ApiSchemaResponseBody_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseBodyContent" ADD CONSTRAINT "ApiSchemaResponseBodyContent_responseBodyId_fkey" FOREIGN KEY ("responseBodyId") REFERENCES "ApiSchemaResponseBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseHeader" ADD CONSTRAINT "ApiSchemaResponseHeader_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaRequestBody" ADD CONSTRAINT "ApiSchemaRequestBody_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaRequestBodyContent" ADD CONSTRAINT "ApiSchemaRequestBodyContent_requestBodyId_fkey" FOREIGN KEY ("requestBodyId") REFERENCES "ApiSchemaRequestBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaExample" ADD CONSTRAINT "ApiSchemaExample_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaModel" ADD CONSTRAINT "ApiSchemaModel_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaParameter" ADD CONSTRAINT "ApiSchemaParameter_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWorkspace" ADD CONSTRAINT "_UserToWorkspace_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWorkspace" ADD CONSTRAINT "_UserToWorkspace_B_fkey" FOREIGN KEY ("B") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaTag" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaTag_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaTag" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaParameter" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaParameter_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaParameter" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaParameter_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaResponseBody" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaResponseBody_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaResponseBody" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaResponseBody_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaResponseBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope" ADD CONSTRAINT "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaSecurityRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope" ADD CONSTRAINT "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaSecurityScope"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope" ADD CONSTRAINT "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaSecurityOAuthFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope" ADD CONSTRAINT "_ApiSchemaSecurityOAuthFlowToApiSchemaSecurityScope_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaSecurityScope"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaResponseBodyToApiSchemaResponseHeader" ADD CONSTRAINT "_ApiSchemaResponseBodyToApiSchemaResponseHeader_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaResponseBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaResponseBodyToApiSchemaResponseHeader" ADD CONSTRAINT "_ApiSchemaResponseBodyToApiSchemaResponseHeader_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaResponseHeader"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaParameter" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaParameter_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaExample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaParameter" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaParameter_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaResponseHeader" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaResponseHeader_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaExample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaResponseHeader" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaResponseHeader_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaResponseHeader"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaResponseBodyContent" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaResponseBodyContent_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaExample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaResponseBodyContent" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaResponseBodyContent_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaResponseBodyContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaRequestBodyContent" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaRequestBodyContent_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaExample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaRequestBodyContent" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaRequestBodyContent_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaRequestBodyContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaParameterToApiSchemaPath" ADD CONSTRAINT "_ApiSchemaParameterToApiSchemaPath_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaParameterToApiSchemaPath" ADD CONSTRAINT "_ApiSchemaParameterToApiSchemaPath_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;