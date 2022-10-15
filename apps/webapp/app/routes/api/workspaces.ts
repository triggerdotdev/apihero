import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getAuthTokenAndUser } from "~/models/authToken.server";
import {
  createWorkspace,
  getWorkspacesWithProjects,
} from "~/models/workspace.server";

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

  if (authToken === null || authToken.userId === null) {
    return json({}, { status: 401 });
  }

  const integrations = await getWorkspacesWithProjects({
    userId: authToken.userId,
  });
  return json(integrations, { status: 200 });
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
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

  if (authToken === null || authToken.userId === null) {
    return json({}, { status: 401 });
  }

  const body = await request.json();
  if (body.name === undefined) {
    return json({}, { status: 400 });
  }

  const workspace = await createWorkspace({
    title: body.name,
    userId: authToken.userId,
  });
  return json(workspace, { status: 200 });
};
