-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasLogs" BOOLEAN NOT NULL DEFAULT false;
