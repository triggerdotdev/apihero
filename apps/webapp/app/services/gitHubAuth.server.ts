import type { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { createFirstProject } from "~/models/project.server";
import { findOrCreateUser } from "~/models/user.server";
import { createFirstWorkspace } from "~/models/workspace.server";
import type { AuthUser } from "./authUser";
import { sendWelcomeEmail } from "./email.server";

const gitHubStrategy = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID ?? "",
    clientSecret: process.env.GITHUB_SECRET ?? "",
    callbackURL: `${process.env.APP_ORIGIN}/auth/github/callback`,
  },
  async ({ accessToken, extraParams, profile }) => {
    const emails = profile.emails;

    if (!emails) {
      throw new Error("GitHub login requires an email address");
    }

    try {
      const { user, isNewUser } = await findOrCreateUser({
        email: emails[0].value,
        authenticationMethod: "GITHUB",
        accessToken,
        authenticationProfile: profile,
        authenticationExtraParams: extraParams,
      });

      if (isNewUser) {
        const firstWorkspace = await createFirstWorkspace(user.id);
        await createFirstProject(user.id, firstWorkspace.id);
        await sendWelcomeEmail(user);
      }

      return {
        userId: user.id,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export function addGitHubStrategy(authenticator: Authenticator<AuthUser>) {
  authenticator.use(gitHubStrategy);
}
