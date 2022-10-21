/*
  Warnings:

  - You are about to drop the column `examples` on the `ApiSchemaParameter` table. All the data in the column will be lost.
  - You are about to drop the column `examples` on the `ApiSchemaResponseHeader` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApiSchemaParameter" DROP COLUMN "examples";

-- AlterTable
ALTER TABLE "ApiSchemaResponseHeader" DROP COLUMN "examples";

-- CreateTable
CREATE TABLE "ApiSchemaExample" (
    "id" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "value" JSONB NOT NULL,
    "parameterId" TEXT,
    "responseHeaderId" TEXT,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaExample_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApiSchemaExample" ADD CONSTRAINT "ApiSchemaExample_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaExample" ADD CONSTRAINT "ApiSchemaExample_responseHeaderId_fkey" FOREIGN KEY ("responseHeaderId") REFERENCES "ApiSchemaResponseHeader"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaExample" ADD CONSTRAINT "ApiSchemaExample_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "ApiSchemaParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
