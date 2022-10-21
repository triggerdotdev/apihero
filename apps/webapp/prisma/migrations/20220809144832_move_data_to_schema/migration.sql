/*
  Warnings:

  - You are about to drop the column `data` on the `Integration` table. All the data in the column will be lost.
  - Added the required column `rawData` to the `ApiSchema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApiSchema" ADD COLUMN     "rawData" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Integration" DROP COLUMN "data";
