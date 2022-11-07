import type { LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "remix-typedjson";
import invariant from "tiny-invariant";
import { requireUserId } from "~/services/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request);
  const { projectSlug, workspaceSlug } = params;
  invariant(workspaceSlug, "workspaceSlug not found");
  invariant(projectSlug, "projectSlug not found");

  return redirect(`/workspaces/${workspaceSlug}/projects/${projectSlug}/home`);
};
