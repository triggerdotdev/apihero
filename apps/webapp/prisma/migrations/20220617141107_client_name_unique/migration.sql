/*
  Warnings:

  - A unique constraint covering the columns `[projectId,name]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Client_projectId_name_key" ON "Client"("projectId", "name");
