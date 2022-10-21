/*
  Warnings:

  - You are about to drop the column `responseBodyId` on the `ApiSchemaResponseHeader` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiSchemaResponseHeader" DROP CONSTRAINT "ApiSchemaResponseHeader_responseBodyId_fkey";

-- AlterTable
ALTER TABLE "ApiSchemaResponseHeader" DROP COLUMN "responseBodyId";

-- CreateTable
CREATE TABLE "_ApiSchemaResponseBodyToApiSchemaResponseHeader" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaResponseBodyToApiSchemaResponseHeader_AB_unique" ON "_ApiSchemaResponseBodyToApiSchemaResponseHeader"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaResponseBodyToApiSchemaResponseHeader_B_index" ON "_ApiSchemaResponseBodyToApiSchemaResponseHeader"("B");

-- AddForeignKey
ALTER TABLE "_ApiSchemaResponseBodyToApiSchemaResponseHeader" ADD CONSTRAINT "_ApiSchemaResponseBodyToApiSchemaResponseHeader_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaResponseBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaResponseBodyToApiSchemaResponseHeader" ADD CONSTRAINT "_ApiSchemaResponseBodyToApiSchemaResponseHeader_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaResponseHeader"("id") ON DELETE CASCADE ON UPDATE CASCADE;
