/*
  Warnings:

  - You are about to drop the column `responseBodyId` on the `ApiSchemaExample` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiSchemaExample" DROP CONSTRAINT "ApiSchemaExample_responseBodyId_fkey";

-- AlterTable
ALTER TABLE "ApiSchemaExample" DROP COLUMN "responseBodyId",
ADD COLUMN     "responseBodyContentId" TEXT;

-- AddForeignKey
ALTER TABLE "ApiSchemaExample" ADD CONSTRAINT "ApiSchemaExample_responseBodyContentId_fkey" FOREIGN KEY ("responseBodyContentId") REFERENCES "ApiSchemaResponseBodyContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
