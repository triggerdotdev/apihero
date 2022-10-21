/*
  Warnings:

  - You are about to drop the column `authorNotes` on the `APISchema` table. All the data in the column will be lost.
  - Added the required column `integrationId` to the `APISchema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "APISchema" DROP COLUMN "authorNotes",
ADD COLUMN     "integrationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "authorNotes" TEXT NOT NULL DEFAULT E'',
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Integration_slug_key" ON "Integration"("slug");

-- AddForeignKey
ALTER TABLE "APISchema" ADD CONSTRAINT "APISchema_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
