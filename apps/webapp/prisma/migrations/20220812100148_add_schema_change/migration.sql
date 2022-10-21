-- CreateTable
CREATE TABLE "ApiSchemaChange" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rawData" JSONB NOT NULL,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApiSchemaChange" ADD CONSTRAINT "ApiSchemaChange_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
