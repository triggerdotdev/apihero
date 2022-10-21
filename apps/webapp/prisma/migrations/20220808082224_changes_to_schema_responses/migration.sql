/*
  Warnings:

  - You are about to drop the column `responseId` on the `ApiSchemaResponseBodyContent` table. All the data in the column will be lost.
  - You are about to drop the column `responseId` on the `ApiSchemaResponseHeader` table. All the data in the column will be lost.
  - You are about to drop the `ApiSchemaResponse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `responseBodyId` to the `ApiSchemaResponseBodyContent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApiSchemaResponse" DROP CONSTRAINT "ApiSchemaResponse_operationId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaResponseBodyContent" DROP CONSTRAINT "ApiSchemaResponseBodyContent_responseId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaResponseHeader" DROP CONSTRAINT "ApiSchemaResponseHeader_responseId_fkey";

-- AlterTable
ALTER TABLE "ApiSchemaResponseBodyContent" DROP COLUMN "responseId",
ADD COLUMN     "responseBodyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ApiSchemaResponseHeader" DROP COLUMN "responseId",
ADD COLUMN     "responseBodyId" TEXT;

-- DropTable
DROP TABLE "ApiSchemaResponse";

-- CreateTable
CREATE TABLE "ApiSchemaResponseBody" (
    "id" TEXT NOT NULL,
    "statusCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "operationId" TEXT NOT NULL,

    CONSTRAINT "ApiSchemaResponseBody_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseBody" ADD CONSTRAINT "ApiSchemaResponseBody_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseHeader" ADD CONSTRAINT "ApiSchemaResponseHeader_responseBodyId_fkey" FOREIGN KEY ("responseBodyId") REFERENCES "ApiSchemaResponseBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseBodyContent" ADD CONSTRAINT "ApiSchemaResponseBodyContent_responseBodyId_fkey" FOREIGN KEY ("responseBodyId") REFERENCES "ApiSchemaResponseBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;
