import type { HttpClient } from "@apihero/database";
import { prisma } from "@apihero/database";

export function createHttpClient({
  projectId,
  integrationId,
}: Pick<HttpClient, "integrationId" | "projectId">) {
  return prisma.httpClient.create({
    data: {
      project: { connect: { id: projectId } },
      integration: { connect: { id: integrationId } },
    },
  });
}

export function getHttpClientFromIntegrationSlug(
  workspaceSlug: string,
  projectSlug: string,
  integrationSlug: string
) {
  return prisma.httpClient.findFirst({
    where: {
      project: { slug: projectSlug, workspace: { slug: workspaceSlug } },
      integration: { slug: integrationSlug },
    },
    include: {
      endpoints: {
        include: {
          operation: {
            include: {
              path: true,
              securityRequirements: {
                include: {
                  securityScheme: true,
                },
              },
            },
          },
        },
      },
      project: {
        select: {
          title: true,
        },
      },
      integration: {
        include: {
          currentSchema: {
            select: {
              id: true,
              tags: {
                orderBy: {
                  operations: {
                    _count: "desc",
                  },
                },
                include: {
                  operations: {
                    include: {
                      path: true,
                      securityRequirements: {
                        include: {
                          securityScheme: true,
                        },
                      },
                    },
                  },
                  _count: {
                    select: { operations: true },
                  },
                },
              },
              securitySchemes: true,
            },
          },
        },
      },
      authentications: {
        include: {
          securityScheme: true,
        },
      },
    },
  });
}

export function setCache({
  clientId,
  enabled,
  ttl,
}: {
  clientId: string;
  enabled: boolean;
  ttl?: number;
}) {
  return prisma.httpClient.update({
    where: {
      id: clientId,
    },
    data: {
      cacheEnabled: enabled,
      cacheTtl: ttl,
    },
  });
}
