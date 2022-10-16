import { prisma } from "@apihero/database";

export async function adminGetUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      createdAt: true,
      displayName: true,
      admin: true,
      workspaces: {
        select: {
          title: true,
          projects: {
            select: {
              title: true,
              httpClients: {
                select: {
                  endpoints: {
                    select: {
                      id: true,
                      _count: {
                        select: {
                          requestLogs: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
