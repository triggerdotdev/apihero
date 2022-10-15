import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Header, NavBar } from "~/libraries/ui";
import { createAuthToken, getAuthToken } from "~/models/authToken.server";
import { getRequestToken } from "~/models/requestToken.server";
import { clearRedirectTo, commitSession } from "~/services/redirectTo.server";
import { requireUserId } from "~/services/session.server";

type LoaderData = {
  success: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const rToken = params.requestToken;
  if (rToken === undefined) {
    return json<LoaderData>({ success: false });
  }

  try {
    const requestToken = await getRequestToken({ token: rToken });

    if (requestToken == null) {
      return json<LoaderData>({ success: false });
    }

    //if there's a matching auth token return it
    const authToken = await getAuthToken({ requestToken: rToken });
    if (authToken != null) {
      return json<LoaderData>(
        { success: true },
        {
          headers: {
            "Set-Cookie": await commitSession(await clearRedirectTo(request)),
          },
        }
      );
    }

    //if there's no matching auth token, create one
    const newAuthToken = await createAuthToken({
      requestTokenId: requestToken.id,
      userId: userId,
    });
    return json<LoaderData>({ success: newAuthToken != null });
  } catch (error) {
    return json<LoaderData>(
      {
        success: false,
      },
      { status: 400 }
    );
  }
};

export default function TokenPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <>
      <Header />
      <div className="flex min-h-full flex-col justify-center bg-slate-200 py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {data.success ? (
              <>
                <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900">
                  😎 Successfully authenticated
                </h1>
                <p className="mt-2 text-center">
                  Go back to your terminal to add an API
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900">
                  Invalid request token
                </h1>
                <p className="mt-2 text-center">
                  The request token may have expired. Please go back to your
                  terminal and try again.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
