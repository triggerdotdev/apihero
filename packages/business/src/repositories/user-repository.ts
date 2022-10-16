import { autoInjectable, inject } from "tsyringe";
import type { JsonObject, PrismaClient } from "@apihero/database";

import type {
  FindOrCreateGithub,
  FindOrCreateMagicLink,
  FindOrCreateUser,
  LoggedInUser,
  UserRepository,
} from "./iuser-repository";
import type { User } from "../shared/user";

@autoInjectable()
export class PrismaUserRepository implements UserRepository {
  constructor(@inject("PrismaClient") private readonly prisma: PrismaClient) {}

  findOrCreateUser(input: FindOrCreateUser): Promise<LoggedInUser> {
    switch (input.authenticationMethod) {
      case "GITHUB": {
        return this.findOrCreateGithubUser(input);
      }
      case "MAGIC_LINK": {
        return this.findOrCreateMagicLinkUser(input);
      }
    }
  }

  private async findOrCreateMagicLinkUser(
    input: FindOrCreateMagicLink
  ): Promise<LoggedInUser> {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: input.email,
      },
    });

    const user = await prisma.user.upsert({
      where: {
        email: input.email,
      },
      update: { email: input.email },
      create: { email: input.email, authenticationMethod: "MAGIC_LINK" },
    });

    return {
      user,
      isNewUser: !existingUser,
    };
  }

  private async findOrCreateGithubUser({
    email,
    accessToken,
    authenticationProfile,
    authenticationExtraParams,
  }: FindOrCreateGithub): Promise<LoggedInUser> {
    const name = authenticationProfile._json.name;
    let avatarUrl: string | undefined = undefined;
    if (authenticationProfile.photos[0]) {
      avatarUrl = authenticationProfile.photos[0].value;
    }
    const displayName = authenticationProfile.displayName;
    const authProfile = authenticationProfile
      ? (authenticationProfile as unknown as JsonObject)
      : undefined;
    const authExtraParams = authenticationExtraParams
      ? (authenticationExtraParams as unknown as JsonObject)
      : undefined;

    const fields = {
      accessToken,
      authenticationProfile: authProfile,
      authenticationExtraParams: authExtraParams,
      name,
      avatarUrl,
      displayName,
    };

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    const user = await prisma.user.upsert({
      where: {
        email,
      },
      update: fields,
      create: { ...fields, email, authenticationMethod: "GITHUB" },
    });

    return {
      user,
      isNewUser: !existingUser,
    };
  }

  async getUserById(id: User["id"]) {
    return prisma.user.findUnique({ where: { id } });
  }

  async getUserByEmail(email: User["email"]) {
    return prisma.user.findUnique({ where: { email } });
  }
}
