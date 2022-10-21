ALTER TABLE IF EXISTS "Workspace" RENAME TO "Project";
ALTER TABLE IF EXISTS "Endpoint" RENAME COLUMN "workspaceId" TO "projectId";