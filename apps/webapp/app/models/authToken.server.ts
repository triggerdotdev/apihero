import { nanoid } from "nanoid";
import { prisma } from "~/db.server";

export function getAuthToken({ requestToken }: { requestToken: string }) {
  return prisma.authToken.findFirst({
    where: {
      requestToken: {
        token: requestToken,
      },
    },
    select: {
      token: true,
      userId: true,
    },
  });
}

export function createAuthToken({
  requestTokenId,
  userId,
}: {
  requestTokenId: string;
  userId: string;
}) {
  return prisma.authToken.create({
    data: {
      requestTokenId,
      userId,
      token: nanoid(64),
    },
  });
}

export function getAuthTokenAndUser({ authToken }: { authToken: string }) {
  return prisma.authToken.findFirst({
    where: {
      token: authToken,
    },
    include: {
      User: true,
    },
  });
}
