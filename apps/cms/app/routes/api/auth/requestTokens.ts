import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { createRequestToken } from "~/models/requestToken.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return {
      status: 405,
    };
  }

  try {
    const token = await createRequestToken();
    return json(
      {
        token: token.token,
      },
      { status: 200 }
    );
  } catch (error) {
    return json(
      {
        error: (error as Error).message,
      },
      { status: 400 }
    );
  }
};
