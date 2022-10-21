/*
  Warnings:

  - You are about to drop the column `ref` on the `ApiSchemaModel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,schemaId]` on the table `ApiSchemaModel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `ApiSchemaModel` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ApiSchemaModel_ref_schemaId_key";

-- AlterTable
ALTER TABLE "ApiSchemaModel" DROP COLUMN "ref",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchemaModel_name_schemaId_key" ON "ApiSchemaModel"("name", "schemaId");
