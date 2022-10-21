-- CreateTable
CREATE TABLE "EndpointExecution" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "developerError" JSONB,
    "props" JSONB,
    "request" JSONB,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endpointId" TEXT,
    "clientId" TEXT,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "EndpointExecution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EndpointExecution" ADD CONSTRAINT "EndpointExecution_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndpointExecution" ADD CONSTRAINT "EndpointExecution_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndpointExecution" ADD CONSTRAINT "EndpointExecution_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
