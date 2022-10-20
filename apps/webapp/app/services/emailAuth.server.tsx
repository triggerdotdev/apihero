import { renderToString } from "react-dom/server";
import type { SendEmailFunction } from "remix-auth-email-link";
import * as emailProvider from "~/services/email.server";
import { EmailLinkStrategy } from "remix-auth-email-link";
import type { Authenticator } from "remix-auth";
import type { AuthUser } from "./authUser";
import { createFirstWorkspace } from "~/models/workspace.server";
import { findOrCreateUser } from "~/models/user.server";

export const sendEmail: SendEmailFunction<AuthUser> = async (options) => {
  let subject = "Log in to API Hero";
  let body = renderToString(
    <div>
      <p>Hello,</p>
      <p>
        Click the link below to securely log in to API Hero. This link will
        expire in 15 minutes.
      </p>
      <br />
      <a href={options.magicLink}>Log in to API Hero</a>
      <br />
      <p>If you did not request this link, you can safely ignore this email.</p>
      <br />
      <p>Thanks,</p>
      <br />
      <p>The API Hero team</p>
    </div>
  );

  await emailProvider.sendEmail(options.emailAddress, subject, body);
};

let secret = process.env.MAGIC_LINK_SECRET;
if (!secret) throw new Error("Missing MAGIC_LINK_SECRET env variable.");

const emailStrategy = new EmailLinkStrategy(
  {
    sendEmail,
    secret,
    callbackURL: "/magic",
    sessionMagicLinkKey: "apihero:magiclink",
  },
  async ({
    email,
    form,
    magicLinkVerify,
  }: {
    email: string;
    form: FormData;
    magicLinkVerify: boolean;
  }) => {
    try {
      const { user, isNewUser } = await findOrCreateUser({
        email,
        authenticationMethod: "MAGIC_LINK",
      });

      await emailProvider.addToEmailList(user);

      if (isNewUser) {
        await createFirstWorkspace(user.id);
      }

      return { userId: user.id };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export function addEmailLinkStrategy(authenticator: Authenticator<AuthUser>) {
  authenticator.use(emailStrategy);
}
