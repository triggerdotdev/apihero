import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getAuthTokenAndUser } from "~/models/authToken.server";
import { createProject } from "~/models/project.server";
import { getWorkspace } from "~/models/workspace.server";

export const action: ActionFunction = async ({ request, params }) => {
  const { workspaceId } = params;
  invariant(workspaceId !== undefined, "workspaceId is required");

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

  const workspace = await getWorkspace({
    id: workspaceId,
    userId: authToken.userId,
  });

  if (workspace === null) {
    return json({}, { status: 404 });
  }

  const body = await request.json();
  if (body.name === undefined) {
    return json({}, { status: 400 });
  }

  const project = await createProject({
    title: body.name,
    workspaceId,
  });

  return json(project, { status: 200 });
};
