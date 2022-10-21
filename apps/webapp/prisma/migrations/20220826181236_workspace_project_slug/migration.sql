-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "slug" TEXT;
UPDATE "Project" SET slug = title;
ALTER TABLE "Project" ALTER COLUMN     "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "slug" TEXT;
UPDATE "Workspace" SET slug = title;
ALTER TABLE "Workspace" ALTER COLUMN     "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_workspaceId_slug_key" ON "Project"("workspaceId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");
