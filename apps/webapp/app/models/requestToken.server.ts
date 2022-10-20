import { prisma } from "~/db.server";
import { nanoid } from "nanoid";

export function createRequestToken() {
  return prisma.requestToken.create({
    data: {
      token: nanoid(32),
      //expires after one day
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
}

export function getRequestToken({ token }: { token: string }) {
  return prisma.requestToken.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
  });
}
