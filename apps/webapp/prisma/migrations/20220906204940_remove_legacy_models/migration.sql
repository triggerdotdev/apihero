/*
  Warnings:

  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Endpoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EndpointExecution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectConstant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Endpoint" DROP CONSTRAINT "Endpoint_clientId_fkey";

-- DropForeignKey
ALTER TABLE "EndpointExecution" DROP CONSTRAINT "EndpointExecution_clientId_fkey";

-- DropForeignKey
ALTER TABLE "EndpointExecution" DROP CONSTRAINT "EndpointExecution_endpointId_fkey";

-- DropForeignKey
ALTER TABLE "EndpointExecution" DROP CONSTRAINT "EndpointExecution_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectConstant" DROP CONSTRAINT "ProjectConstant_projectId_fkey";

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "Endpoint";

-- DropTable
DROP TABLE "EndpointExecution";

-- DropTable
DROP TABLE "ProjectConstant";
