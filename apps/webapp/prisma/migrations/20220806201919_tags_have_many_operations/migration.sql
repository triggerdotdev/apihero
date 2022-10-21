/*
  Warnings:

  - You are about to drop the column `operationId` on the `ApiSchemaTag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiSchemaTag" DROP CONSTRAINT "ApiSchemaTag_operationId_fkey";

-- AlterTable
ALTER TABLE "ApiSchemaTag" DROP COLUMN "operationId";

-- CreateTable
CREATE TABLE "_ApiSchemaOperationToApiSchemaTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaOperationToApiSchemaTag_AB_unique" ON "_ApiSchemaOperationToApiSchemaTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaOperationToApiSchemaTag_B_index" ON "_ApiSchemaOperationToApiSchemaTag"("B");

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaTag" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaTag_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaOperationToApiSchemaTag" ADD CONSTRAINT "_ApiSchemaOperationToApiSchemaTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
