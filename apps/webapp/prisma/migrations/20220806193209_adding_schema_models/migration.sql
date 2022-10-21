-- AlterTable
ALTER TABLE "ApiSchemaRequestBodyContent" ADD COLUMN     "apiSchemaModelId" TEXT;

-- AlterTable
ALTER TABLE "ApiSchemaResponseBodyContent" ADD COLUMN     "apiSchemaModelId" TEXT;

-- CreateTable
CREATE TABLE "ApiSchemaModel" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "contents" JSONB NOT NULL,
    "example" JSONB,
    "schemaId" TEXT NOT NULL,
    "requestBodyContentId" TEXT,
    "responseBodyContentId" TEXT,

    CONSTRAINT "ApiSchemaModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaModel_requestBodyContentId_key" ON "ApiSchemaModel"("requestBodyContentId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaModel_responseBodyContentId_key" ON "ApiSchemaModel"("responseBodyContentId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaModel_ref_schemaId_key" ON "ApiSchemaModel"("ref", "schemaId");

-- AddForeignKey
ALTER TABLE "ApiSchemaModel" ADD CONSTRAINT "ApiSchemaModel_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaModel" ADD CONSTRAINT "ApiSchemaModel_responseBodyContentId_fkey" FOREIGN KEY ("responseBodyContentId") REFERENCES "ApiSchemaResponseBodyContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaModel" ADD CONSTRAINT "ApiSchemaModel_requestBodyContentId_fkey" FOREIGN KEY ("requestBodyContentId") REFERENCES "ApiSchemaRequestBodyContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
