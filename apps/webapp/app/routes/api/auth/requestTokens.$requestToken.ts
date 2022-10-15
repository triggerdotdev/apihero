import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getAuthToken } from "~/models/authToken.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  if (request.method !== "GET") {
    return {
      status: 405,
    };
  }

  const requestToken = params.requestToken;

  if (requestToken === undefined) {
    return {
      status: 400,
    };
  }

  try {
    const authToken = await getAuthToken({ requestToken: requestToken });

    if (authToken === null) {
      return {
        status: 404,
      };
    }

    return json(
      {
        authToken: authToken.token,
        userId: authToken.userId,
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
