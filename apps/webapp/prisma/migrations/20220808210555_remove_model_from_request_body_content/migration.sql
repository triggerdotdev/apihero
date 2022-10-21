/*
  Warnings:

  - You are about to drop the column `requestBodyContentId` on the `ApiSchemaModel` table. All the data in the column will be lost.
  - You are about to drop the column `responseBodyContentId` on the `ApiSchemaModel` table. All the data in the column will be lost.
  - You are about to drop the column `isArray` on the `ApiSchemaRequestBodyContent` table. All the data in the column will be lost.
  - You are about to drop the column `isArray` on the `ApiSchemaResponseBodyContent` table. All the data in the column will be lost.
  - Made the column `validationSchema` on table `ApiSchemaRequestBodyContent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `validationSchema` on table `ApiSchemaResponseBodyContent` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ApiSchemaModel" DROP CONSTRAINT "ApiSchemaModel_requestBodyContentId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaModel" DROP CONSTRAINT "ApiSchemaModel_responseBodyContentId_fkey";

-- DropIndex
DROP INDEX "ApiSchemaModel_requestBodyContentId_key";

-- DropIndex
DROP INDEX "ApiSchemaModel_responseBodyContentId_key";

-- AlterTable
ALTER TABLE "ApiSchemaModel" DROP COLUMN "requestBodyContentId",
DROP COLUMN "responseBodyContentId";

-- AlterTable
ALTER TABLE "ApiSchemaRequestBodyContent" DROP COLUMN "isArray",
ALTER COLUMN "validationSchema" SET NOT NULL;

-- AlterTable
ALTER TABLE "ApiSchemaResponseBodyContent" DROP COLUMN "isArray",
ALTER COLUMN "validationSchema" SET NOT NULL;
