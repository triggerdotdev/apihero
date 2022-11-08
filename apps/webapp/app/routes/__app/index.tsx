import type { LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "remix-typedjson";
import { requireUserId } from "~/services/session.server";
import { getWorkspaces } from "~/models/workspace.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const workspaces = await getWorkspaces({ userId });
  const workspaceWithProject = workspaces.find(
    (workspace) => workspace.projects.length
  );

  if (workspaceWithProject) {
    return redirect(
      `/workspaces/${workspaceWithProject.slug}/projects/${workspaceWithProject.projects[0].slug}/home`
    );
  }
  return redirect(`/workspaces/new`);
};
