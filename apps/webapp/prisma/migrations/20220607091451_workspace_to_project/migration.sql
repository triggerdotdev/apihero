-- AlterTable
ALTER TABLE "Project" RENAME CONSTRAINT "Workspace_pkey" TO "Project_pkey";

-- RenameForeignKey
ALTER TABLE "Endpoint" RENAME CONSTRAINT "Endpoint_workspaceId_fkey" TO "Endpoint_projectId_fkey";

-- RenameForeignKey
ALTER TABLE "Project" RENAME CONSTRAINT "Workspace_organizationId_fkey" TO "Project_organizationId_fkey";
