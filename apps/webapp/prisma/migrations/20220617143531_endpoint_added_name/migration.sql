/*
  Warnings:

  - A unique constraint covering the columns `[clientId,name]` on the table `Endpoint` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Endpoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Endpoint" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Endpoint_clientId_name_key" ON "Endpoint"("clientId", "name");
