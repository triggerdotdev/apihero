-- CreateTable
CREATE TABLE "EndpointExecution" (
    "id" TEXT NOT NULL,
    "request" JSONB NOT NULL,
    "variables" JSONB NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endpointId" TEXT NOT NULL,

    CONSTRAINT "EndpointExecution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EndpointExecution" ADD CONSTRAINT "EndpointExecution_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
