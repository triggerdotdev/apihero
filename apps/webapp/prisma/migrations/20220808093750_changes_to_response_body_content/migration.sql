/*
  Warnings:

  - You are about to drop the column `apiSchemaModelId` on the `ApiSchemaResponseBodyContent` table. All the data in the column will be lost.
  - You are about to drop the column `examples` on the `ApiSchemaResponseBodyContent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApiSchemaExample" ADD COLUMN     "responseBodyId" TEXT;

-- AlterTable
ALTER TABLE "ApiSchemaResponseBodyContent" DROP COLUMN "apiSchemaModelId",
DROP COLUMN "examples";

-- AddForeignKey
ALTER TABLE "ApiSchemaExample" ADD CONSTRAINT "ApiSchemaExample_responseBodyId_fkey" FOREIGN KEY ("responseBodyId") REFERENCES "ApiSchemaResponseBodyContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
