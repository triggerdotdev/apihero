/*
  Warnings:

  - You are about to drop the column `endpointId` on the `ProjectConstant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectConstant" DROP CONSTRAINT "ProjectConstant_endpointId_fkey";

-- AlterTable
ALTER TABLE "ProjectConstant" DROP COLUMN "endpointId";

-- CreateTable
CREATE TABLE "_EndpointToProjectConstant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EndpointToProjectConstant_AB_unique" ON "_EndpointToProjectConstant"("A", "B");

-- CreateIndex
CREATE INDEX "_EndpointToProjectConstant_B_index" ON "_EndpointToProjectConstant"("B");

-- AddForeignKey
ALTER TABLE "_EndpointToProjectConstant" ADD CONSTRAINT "_EndpointToProjectConstant_A_fkey" FOREIGN KEY ("A") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EndpointToProjectConstant" ADD CONSTRAINT "_EndpointToProjectConstant_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectConstant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
