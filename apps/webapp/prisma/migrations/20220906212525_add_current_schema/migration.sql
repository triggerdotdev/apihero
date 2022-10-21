-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "currentSchemaId" TEXT;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_currentSchemaId_fkey" FOREIGN KEY ("currentSchemaId") REFERENCES "ApiSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;
