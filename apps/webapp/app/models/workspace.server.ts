import { prisma } from "~/db.server";
import type { Project, User, Workspace } from "@prisma/client";
import slug from "slug";
export type { Workspace } from "@prisma/client";

export function getWorkspace({
  userId,
  id,
}: Pick<Workspace, "id"> & {
  userId: User["id"];
}) {
  return prisma.workspace.findFirst({
    where: { id, users: { some: { id: userId } } },
  });
}

export function getWorkspaceFromSlug({
  userId,
  slug,
}: Pick<Workspace, "slug"> & {
  userId: User["id"];
}) {
  return prisma.workspace.findFirst({
    where: { slug, users: { some: { id: userId } } },
  });
}

export function getWorkspaceForProjectId({
  userId,
  projectId,
}: {
  userId: User["id"];
  projectId: Project["id"];
}) {
  return prisma.workspace.findFirst({
    where: {
      projects: { some: { id: projectId } },
      users: { some: { id: userId } },
    },
  });
}

export function getWorkspaces({ userId }: { userId: User["id"] }) {
  return prisma.workspace.findMany({
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          httpClients: true,
        },
      },
    },
    where: { users: { some: { id: userId } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getWorkspacesWithProjects({ userId }: { userId: User["id"] }) {
  return prisma.workspace.findMany({
    where: { users: { some: { id: userId } } },
    select: {
      id: true,
      title: true,
      slug: true,
      projects: {
        select: { id: true, title: true, slug: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createFirstWorkspace(userId: string) {
  await createWorkspace({
    title: "Personal workspace",
    userId: userId,
  });
}

export async function createWorkspace({
  title,
  userId,
}: Pick<Workspace, "title"> & {
  userId: User["id"];
}) {
  let desiredSlug = slug(title);

  const withSameSlug = await prisma.workspace.findFirst({
    where: { slug: desiredSlug },
  });

  if (withSameSlug == null) {
    return prisma.workspace.create({
      data: {
        title,
        slug: desiredSlug,
        users: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  const workspacesWithMatchingSlugs = await getWorkspacesWithMatchingSlug({
    slug: desiredSlug,
  });

  for (let i = 1; i < 1000; i++) {
    const alternativeSlug = `${desiredSlug}-${i}`;
    if (
      workspacesWithMatchingSlugs.find(
        (workspace) => workspace.slug === alternativeSlug
      )
    ) {
      continue;
    }

    return prisma.workspace.create({
      data: {
        title,
        slug: alternativeSlug,
        users: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  throw new Error("Could not create workspace with a unique slug");
}

function getWorkspacesWithMatchingSlug({ slug }: { slug: string }) {
  return prisma.workspace.findMany({
    where: {
      slug: {
        startsWith: slug,
      },
    },
    select: { slug: true },
    orderBy: { slug: "desc" },
  });
}

export function deleteWorkspace({
  id,
}: Pick<Workspace, "id"> & { userId: User["id"] }) {
  return prisma.workspace.deleteMany({
    where: { id },
  });
}
