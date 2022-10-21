-- CreateTable
CREATE TABLE "HttpClientAuthentication" (
    "id" TEXT NOT NULL,
    "httpClientId" TEXT NOT NULL,
    "securitySchemeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authenticationData" JSONB,

    CONSTRAINT "HttpClientAuthentication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HttpClientAuthentication_httpClientId_securitySchemeId_key" ON "HttpClientAuthentication"("httpClientId", "securitySchemeId");

-- AddForeignKey
ALTER TABLE "HttpClientAuthentication" ADD CONSTRAINT "HttpClientAuthentication_httpClientId_fkey" FOREIGN KEY ("httpClientId") REFERENCES "HttpClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpClientAuthentication" ADD CONSTRAINT "HttpClientAuthentication_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "ApiSchemaSecurityScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
