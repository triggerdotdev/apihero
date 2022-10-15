import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getAuthTokenAndUser } from "~/models/authToken.server";
import { searchIntegrations } from "~/models/integration.server";

export const loader: LoaderFunction = async ({ request }) => {
  if (request.method !== "GET") {
    return json({}, { status: 405 });
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader == null) {
    return json({}, { status: 401 });
  }

  const authTokenString = authHeader.split(" ")[1];
  if (authTokenString === undefined || authTokenString === "") {
    return json({}, { status: 401 });
  }

  const authToken = await getAuthTokenAndUser({ authToken: authTokenString });

  if (authToken === null) {
    return json({}, { status: 401 });
  }

  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const searchQuery = search.get("query");
  if (searchQuery == null) {
    return json({}, { status: 400 });
  }

  const integrations = await searchIntegrations({ query: searchQuery });
  return json(integrations, { status: 200 });
};
