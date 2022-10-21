/*
  Warnings:

  - You are about to drop the column `operationId` on the `ApiSchemaRequestBody` table. All the data in the column will be lost.
  - You are about to drop the column `apiSchemaModelId` on the `ApiSchemaRequestBodyContent` table. All the data in the column will be lost.
  - You are about to drop the column `operationId` on the `ApiSchemaResponseBody` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ref,schemaId]` on the table `ApiSchemaParameter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ref,schemaId]` on the table `ApiSchemaRequestBody` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ref,schemaId]` on the table `ApiSchemaResponseBody` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schemaId` to the `ApiSchemaRequestBody` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schemaId` to the `ApiSchemaResponseBody` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApiSchemaRequestBody" DROP CONSTRAINT "ApiSchemaRequestBody_operationId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaResponseBody" DROP CONSTRAINT "ApiSchemaResponseBody_operationId_fkey";

-- DropIndex
DROP INDEX "ApiSchemaRequestBody_operationId_key";

-- AlterTable
ALTER TABLE "ApiSchemaOperation" ADD COLUMN     "requestBodyId" TEXT;

-- AlterTable
ALTER TABLE "ApiSchemaRequestBody" DROP COLUMN "operationId",
ADD COLUMN     "ref" TEXT,
ADD COLUMN     "schemaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ApiSchemaRequestBodyContent" DROP COLUMN "apiSchemaModelId";

-- AlterTable
ALTER TABLE "ApiSchemaResponseBody" DROP COLUMN "operationId",
ADD COLUMN     "ref" TEXT,
ADD COLUMN     "schemaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_ApiSchemaOperationToApiSchemaResponseBody" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaOperationToApiSchemaResponseBody_AB_unique" ON "_ApiSchemaOperationToApiSchemaResponseBody"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaOperationToApiSchemaResponseBody_B_index" ON "_ApiSchemaOperationToApiSchemaResponseBody"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaParameter_ref_schemaId_key" ON "ApiSchemaParameter"("ref", "schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaRequestBody_ref_schemaId_key" ON "ApiSchemaRequestBody"("ref", "schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaResponseBody_ref_schemaId_key" ON "ApiSchemaResponseBody"("ref", "schemaId");

-- AddForeignKey
ALTER TABLE "ApiSchemaOperation" ADD CONSTRAINT "ApiSchemaOperation_requestBodyId_fkey" FOREIGN KEY ("requestBodyId") REFERENCES "ApiSchemaRequestBody"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseBody" ADD CONSTRAINT "ApiSchemaResponseBody_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaRequestBody" ADD CONSTRAINT "ApiSchemaRequestBody_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApiSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaResponseBody" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaResponseBody_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaResponseBody" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaResponseBody_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaResponseBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;
