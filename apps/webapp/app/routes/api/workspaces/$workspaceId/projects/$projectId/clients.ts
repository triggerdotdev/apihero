import { Prisma } from ".prisma/client";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getAuthTokenAndUser } from "~/models/authToken.server";
import { createHttpClient } from "~/models/httpClient.server";
import { getProject } from "~/models/project.server";
import { getWorkspace } from "~/models/workspace.server";

export const action: ActionFunction = async ({ request, params }) => {
  const { workspaceId, projectId } = params;
  invariant(workspaceId !== undefined, "workspaceId is required");
  invariant(projectId !== undefined, "projectId is required");

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

  const project = await getProject({ workspaceId, id: projectId });

  if (project === null) {
    return json({}, { status: 404 });
  }

  const body = await request.json();
  if (
    body.integrationId === undefined ||
    typeof body.integrationId !== "string"
  ) {
    return json({ error: "No integration id" }, { status: 400 });
  }

  const url = new URL(request.url);
  const authenticationUrl = `${url.origin}/workspaces/${workspace.slug}/projects/${project.slug}`;

  try {
    const client = await createHttpClient({
      projectId,
      integrationId: body.integrationId,
    });

    return json(
      { ...client, success: true, authenticationUrl },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return json(
          {
            success: true,
            authenticationUrl,
            integrationId: body.integrationId,
          },
          { status: 200 }
        );
      }

      return json(
        {
          success: false,
          error: `Something went wrong: ${error.message}`,
        },
        { status: 422 }
      );
    }

    return json(
      {
        success: false,
        error: `Something went wrong: Unknown error`,
      },
      { status: 422 }
    );
  }
};
