/*
  Warnings:

  - You are about to drop the column `projectId` on the `Endpoint` table. All the data in the column will be lost.
  - You are about to drop the column `request` on the `Endpoint` table. All the data in the column will be lost.
  - You are about to drop the `EndpointExecution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EndpointVariable` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `path` to the `Endpoint` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Endpoint" DROP CONSTRAINT "Endpoint_projectId_fkey";

-- DropForeignKey
ALTER TABLE "EndpointExecution" DROP CONSTRAINT "EndpointExecution_endpointId_fkey";

-- DropForeignKey
ALTER TABLE "EndpointVariable" DROP CONSTRAINT "EndpointVariable_endpointId_fkey";

TRUNCATE TABLE "Endpoint";

-- AlterTable
ALTER TABLE "Endpoint" DROP COLUMN "projectId",
DROP COLUMN "request",
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "headers" JSONB,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "query" JSONB,
ADD COLUMN     "responseBodySchema" JSONB,
ADD COLUMN     "responseTransform" TEXT,
ADD COLUMN     "timeout" INTEGER;

-- DropTable
DROP TABLE "EndpointExecution";

-- DropTable
DROP TABLE "EndpointVariable";

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "authorization" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
