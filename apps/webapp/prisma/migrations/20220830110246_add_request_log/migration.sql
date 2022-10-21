-- CreateTable
CREATE TABLE "HttpRequestLog" (
    "id" SERIAL NOT NULL,
    "method" "HTTPMethod" NOT NULL DEFAULT 'GET',
    "statusCode" INTEGER NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "requestBody" JSONB,
    "requestHeaders" JSONB,
    "responseBody" JSONB,
    "responseHeaders" JSONB,
    "integrationId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "params" JSONB,
    "mappings" JSONB,
    "isCacheHit" BOOLEAN NOT NULL,
    "responseSize" INTEGER NOT NULL DEFAULT 0,
    "requestDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gatewayDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "HttpRequestLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HttpRequestLog" ADD CONSTRAINT "HttpRequestLog_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpRequestLog" ADD CONSTRAINT "HttpRequestLog_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpRequestLog" ADD CONSTRAINT "HttpRequestLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
