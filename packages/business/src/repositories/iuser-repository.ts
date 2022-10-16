import type { User } from "../shared/types";
import type { GitHubProfile } from "remix-auth-github";

export type FindOrCreateMagicLink = {
  authenticationMethod: "MAGIC_LINK";
  email: string;
};

export type FindOrCreateGithub = {
  authenticationMethod: "GITHUB";
  email: User["email"];
  accessToken: User["accessToken"];
  authenticationProfile: GitHubProfile;
  authenticationExtraParams: Record<string, unknown>;
};

export type FindOrCreateUser = FindOrCreateMagicLink | FindOrCreateGithub;

export type LoggedInUser = {
  user: User;
  isNewUser: boolean;
};

export interface UserRepository {
  findOrCreateUser(input: FindOrCreateUser): Promise<LoggedInUser>;
  getUserById(id: User["id"]): Promise<User>;
  getUserByEmail(email: User["email"]): Promise<User>;
}
