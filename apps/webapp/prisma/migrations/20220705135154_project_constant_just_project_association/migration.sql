/*
  Warnings:

  - You are about to drop the column `clientId` on the `ProjectConstant` table. All the data in the column will be lost.
  - You are about to drop the `_EndpointToProjectConstant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,projectId]` on the table `ProjectConstant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProjectConstant" DROP CONSTRAINT "ProjectConstant_clientId_fkey";

-- DropForeignKey
ALTER TABLE "_EndpointToProjectConstant" DROP CONSTRAINT "_EndpointToProjectConstant_A_fkey";

-- DropForeignKey
ALTER TABLE "_EndpointToProjectConstant" DROP CONSTRAINT "_EndpointToProjectConstant_B_fkey";

-- AlterTable
ALTER TABLE "ProjectConstant" DROP COLUMN "clientId";

-- DropTable
DROP TABLE "_EndpointToProjectConstant";

-- CreateIndex
CREATE UNIQUE INDEX "ProjectConstant_name_projectId_key" ON "ProjectConstant"("name", "projectId");
