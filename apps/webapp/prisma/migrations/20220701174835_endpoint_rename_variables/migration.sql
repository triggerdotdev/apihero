/*
  Warnings:

  - You are about to drop the column `props` on the `Endpoint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Endpoint" DROP COLUMN "props",
ADD COLUMN     "variables" TEXT[];
