/*
  Warnings:

  - You are about to drop the column `familyName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `givenName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "familyName",
DROP COLUMN "givenName",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "name" TEXT;
