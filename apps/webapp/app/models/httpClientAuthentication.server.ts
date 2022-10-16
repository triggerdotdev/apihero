import { prisma } from "@apihero/database";

export function upsertBasicAuthentication(
  clientId: string,
  schemeId: string,
  { username, password }: { username: string; password: string }
) {
  return prisma.httpClientAuthentication.upsert({
    where: {
      httpClientId_securitySchemeId: {
        httpClientId: clientId,
        securitySchemeId: schemeId,
      },
    },
    update: {
      username,
      password,
    },
    create: {
      username,
      password,
      httpClient: {
        connect: { id: clientId },
      },
      securityScheme: {
        connect: { id: schemeId },
      },
    },
  });
}

export function upsertBearerAuthentication(
  clientId: string,
  schemeId: string,
  { token }: { token: string }
) {
  return prisma.httpClientAuthentication.upsert({
    where: {
      httpClientId_securitySchemeId: {
        httpClientId: clientId,
        securitySchemeId: schemeId,
      },
    },
    update: {
      password: token,
    },
    create: {
      password: token,
      httpClient: {
        connect: { id: clientId },
      },
      securityScheme: {
        connect: { id: schemeId },
      },
    },
  });
}

export function deleteAuthentication(clientId: string, schemeId: string) {
  return prisma.httpClientAuthentication.delete({
    where: {
      httpClientId_securitySchemeId: {
        httpClientId: clientId,
        securitySchemeId: schemeId,
      },
    },
  });
}
