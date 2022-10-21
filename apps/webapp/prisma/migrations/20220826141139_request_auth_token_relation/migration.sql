/*
  Warnings:

  - You are about to drop the column `status` on the `RequestToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[requestTokenId]` on the table `AuthToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `requestTokenId` to the `AuthToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuthToken" ADD COLUMN     "requestTokenId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RequestToken" DROP COLUMN "status";

-- DropEnum
DROP TYPE "RequestTokenStatus";

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_requestTokenId_key" ON "AuthToken"("requestTokenId");

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_requestTokenId_fkey" FOREIGN KEY ("requestTokenId") REFERENCES "RequestToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
