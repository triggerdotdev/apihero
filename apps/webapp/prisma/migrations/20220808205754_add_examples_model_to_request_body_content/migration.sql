/*
  Warnings:

  - You are about to drop the column `examples` on the `ApiSchemaRequestBodyContent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApiSchemaExample" ADD COLUMN     "requestBodyContentId" TEXT;

-- AlterTable
ALTER TABLE "ApiSchemaRequestBodyContent" DROP COLUMN "examples";

-- AddForeignKey
ALTER TABLE "ApiSchemaExample" ADD CONSTRAINT "ApiSchemaExample_requestBodyContentId_fkey" FOREIGN KEY ("requestBodyContentId") REFERENCES "ApiSchemaRequestBodyContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
