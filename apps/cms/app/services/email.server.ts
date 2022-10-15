import type { User } from "~/models/user.server";
import { Client } from "@sendgrid/client";

const sendGridApiKey = process.env.SENDGRID_API_KEY;
const client = new Client();
client.setApiKey(sendGridApiKey ?? "");

export async function sendEmail(
  emailAddress: string,
  subject: string,
  body: string
) {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${sendGridApiKey}`,
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: emailAddress }],
        },
      ],
      from: {
        email: process.env.SENDGRID_FROM_EMAIL ?? "hi@apihero.run",
        name: "API Hero",
      },
      content: [{ type: "text/html", value: body }],
      subject,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }

  if (response.status === 202) {
    return;
  }

  return response.json();
}

export async function addToEmailList(user: User) {
  if (!sendGridApiKey) {
    console.log("Missing SENDGRID_API_KEY");
    return;
  }

  const contacts = user.name
    ? [
        {
          email: user.email,
          custom_fields: {
            // This is the user's full_name field.
            e2_T: user.name,
          },
        },
      ]
    : [
        {
          email: user.email,
        },
      ];

  try {
    const response = await fetch(
      "https://api.sendgrid.com/v3/marketing/contacts",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sendGridApiKey}`,
        },
        body: JSON.stringify({ contacts }),
      }
    );

    await response.json();
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(error);
  }
}
