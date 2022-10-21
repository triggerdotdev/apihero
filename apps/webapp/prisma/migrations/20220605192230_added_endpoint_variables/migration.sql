-- CreateTable
CREATE TABLE "EndpointVariable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endpointId" TEXT NOT NULL,

    CONSTRAINT "EndpointVariable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EndpointVariable" ADD CONSTRAINT "EndpointVariable_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
