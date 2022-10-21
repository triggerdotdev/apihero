/*
  Warnings:

  - You are about to drop the column `value` on the `EndpointVariable` table. All the data in the column will be lost.
  - Added the required column `required` to the `EndpointVariable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EndpointVariable" DROP COLUMN "value",
ADD COLUMN     "defaultValue" TEXT,
ADD COLUMN     "exampleValue" TEXT,
ADD COLUMN     "required" BOOLEAN NOT NULL;
