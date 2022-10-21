/*
  Warnings:

  - You are about to drop the column `integrationId` on the `HttpRequestLog` table. All the data in the column will be lost.
  - You are about to drop the column `operationId` on the `HttpRequestLog` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `HttpRequestLog` table. All the data in the column will be lost.
  - Added the required column `endpointId` to the `HttpRequestLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HttpRequestLog" DROP CONSTRAINT "HttpRequestLog_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "HttpRequestLog" DROP CONSTRAINT "HttpRequestLog_operationId_fkey";

-- DropForeignKey
ALTER TABLE "HttpRequestLog" DROP CONSTRAINT "HttpRequestLog_projectId_fkey";

-- AlterTable
ALTER TABLE "HttpRequestLog" DROP COLUMN "integrationId",
DROP COLUMN "operationId",
DROP COLUMN "projectId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endpointId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "HttpClient" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HttpClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HttpEndpoint" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HttpEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HttpClient_projectId_integrationId_key" ON "HttpClient"("projectId", "integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "HttpEndpoint_clientId_operationId_key" ON "HttpEndpoint"("clientId", "operationId");

-- AddForeignKey
ALTER TABLE "HttpClient" ADD CONSTRAINT "HttpClient_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpClient" ADD CONSTRAINT "HttpClient_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpEndpoint" ADD CONSTRAINT "HttpEndpoint_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "HttpClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpEndpoint" ADD CONSTRAINT "HttpEndpoint_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HttpRequestLog" ADD CONSTRAINT "HttpRequestLog_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "HttpEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
