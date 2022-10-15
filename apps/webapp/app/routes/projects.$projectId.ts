import type { LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getWorkspaceForProjectId } from "~/models/workspace.server";
import { requireUserId } from "~/services/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const projectId = params.projectId;
  invariant(projectId, "projectId not found");
  const userId = await requireUserId(request);

  const workspace = await getWorkspaceForProjectId({ projectId, userId });
  invariant(workspace, "workspace not found");

  return redirect(`/workspaces/${workspace.id}/projects/${projectId}`);
};
