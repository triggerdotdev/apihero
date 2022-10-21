/*
  Warnings:

  - You are about to drop the column `scopes` on the `ApiSchemaSecurityRequirement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApiSchemaSecurityRequirement" DROP COLUMN "scopes";

-- CreateTable
CREATE TABLE "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope_AB_unique" ON "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope"("A", "B");

-- CreateIndex
CREATE INDEX "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope_B_index" ON "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope"("B");

-- AddForeignKey
ALTER TABLE "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope" ADD CONSTRAINT "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope_A_fkey" FOREIGN KEY ("A") REFERENCES "ApiSchemaSecurityRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope" ADD CONSTRAINT "_ApiSchemaSecurityRequirementToApiSchemaSecurityScope_B_fkey" FOREIGN KEY ("B") REFERENCES "ApiSchemaSecurityScope"("id") ON DELETE CASCADE ON UPDATE CASCADE;
