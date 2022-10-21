/*
  Warnings:

  - You are about to drop the column `parameterId` on the `ApiSchemaExample` table. All the data in the column will be lost.
  - You are about to drop the column `requestBodyContentId` on the `ApiSchemaExample` table. All the data in the column will be lost.
  - You are about to drop the column `responseBodyContentId` on the `ApiSchemaExample` table. All the data in the column will be lost.
  - You are about to drop the column `responseHeaderId` on the `ApiSchemaExample` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiSchemaExample" DROP CONSTRAINT "ApiSchemaExample_parameterId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaExample" DROP CONSTRAINT "ApiSchemaExample_requestBodyContentId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaExample" DROP CONSTRAINT "ApiSchemaExample_responseBodyContentId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaExample" DROP CONSTRAINT "ApiSchemaExample_responseHeaderId_fkey";

-- AlterTable
ALTER TABLE "ApiSchemaExample" DROP COLUMN "parameterId",
DROP COLUMN "requestBodyContentId",
DROP COLUMN "responseBodyContentId",
DROP COLUMN "responseHeaderId";

-- CreateTable
CREATE TABLE "_ApiSchemaExampleToApiSchemaParameter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaExampleToApiSchemaResponseHeader" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaExampleToApiSchemaResponseBodyContent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApiSchemaExampleToApiSchemaRequestBodyContent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaExampleToApiSchemaParameter_AB_unique" ON "_ApiSchemaExampleToApiSchemaParameter"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaExampleToApiSchemaParameter_B_index" ON "_ApiSchemaExampleToApiSchemaParameter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaExampleToApiSchemaResponseHeader_AB_unique" ON "_ApiSchemaExampleToApiSchemaResponseHeader"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaExampleToApiSchemaResponseHeader_B_index" ON "_ApiSchemaExampleToApiSchemaResponseHeader"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaExampleToApiSchemaResponseBodyContent_AB_unique" ON "_ApiSchemaExampleToApiSchemaResponseBodyContent"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaExampleToApiSchemaResponseBodyContent_B_index" ON "_ApiSchemaExampleToApiSchemaResponseBodyContent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaExampleToApiSchemaRequestBodyContent_AB_unique" ON "_ApiSchemaExampleToApiSchemaRequestBodyContent"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaExampleToApiSchemaRequestBodyContent_B_index" ON "_ApiSchemaExampleToApiSchemaRequestBodyContent"("B");

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaParameter" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaParameter_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaExample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaParameter" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaParameter_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaResponseHeader" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaResponseHeader_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaExample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaResponseHeader" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaResponseHeader_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaResponseHeader"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaResponseBodyContent" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaResponseBodyContent_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaExample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaResponseBodyContent" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaResponseBodyContent_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaResponseBodyContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaRequestBodyContent" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaRequestBodyContent_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaExample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaExampleToApiSchemaRequestBodyContent" ADD CONSTRAINT "_ApiSchemaExampleToApiSchemaRequestBodyContent_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaRequestBodyContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
