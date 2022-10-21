/*
  Warnings:

  - The `variables` column on the `Endpoint` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Endpoint" DROP COLUMN "variables",
ADD COLUMN     "variables" JSONB;
