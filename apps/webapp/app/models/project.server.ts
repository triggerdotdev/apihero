import type { Project, User, Workspace } from ".prisma/client";
import slug from "slug";
import { prisma } from "~/db.server";

export function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { workspace: true },
  });
}

export function getProject({
  workspaceId,
  id,
}: Pick<Project, "id"> & {
  workspaceId: Workspace["id"];
}) {
  return prisma.project.findFirst({
    where: { id, workspaceId },
  });
}

export function getProjectFromSlugs({
  workspaceSlug,
  slug,
}: Pick<Project, "slug"> & {
  workspaceSlug: Workspace["slug"];
}) {
  return prisma.project.findFirst({
    where: { slug, workspace: { slug: workspaceSlug } },
  });
}

export function getProjectByKey(id: string, slug: string) {
  return prisma.project.findFirst({
    where: { id },
    include: {
      workspace: true,
      httpClients: {
        where: {
          integration: {
            slug,
          },
        },
        include: {
          authentications: {
            include: {
              securityScheme: true,
            },
          },
        },
      },
    },
  });
}

export function getProjects({ workspaceId }: { workspaceId: Workspace["id"] }) {
  return prisma.project.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
  });
}

export function setHasCompletedLogsOnboarding(projectSlug: string) {
  return prisma.project.updateMany({
    where: { slug: projectSlug },
    data: { hasCompletedOnboarding: true },
  });
}

export function setHasLogs(projectId: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: { hasLogs: true },
  });
}

export async function createFirstProject(userId: string, workspaceId: string) {
  return await createProject({
    title: "My project",
    workspaceId,
  });
}

export function createProject({
  title,
  workspaceId,
}: Pick<Project, "title"> & {
  workspaceId: Workspace["id"];
}) {
  const desiredSlug = slug(title);
  return prisma.project.create({
    data: {
      title,
      slug: desiredSlug,
      workspace: {
        connect: {
          id: workspaceId,
        },
      },
    },
  });
}

export function deleteProject({
  id,
  userId,
}: Pick<Project, "id"> & {
  userId: User["id"];
}) {
  return prisma.project.deleteMany({
    where: {
      id,
      workspace: {
        users: {
          some: { id: userId },
        },
      },
    },
  });
}
