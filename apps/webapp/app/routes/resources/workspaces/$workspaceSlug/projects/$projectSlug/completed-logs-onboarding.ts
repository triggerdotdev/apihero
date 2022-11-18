import type { ActionFunction } from "@remix-run/server-runtime";
import { redirect } from "remix-typedjson";
import invariant from "tiny-invariant";
import { setHasCompletedLogsOnboarding } from "~/models/project.server";

export const action: ActionFunction = async ({ params }) => {
  const { projectSlug, workspaceSlug } = params;
  invariant(projectSlug, "projectId is required");
  invariant(workspaceSlug, "workspaceSlug is required");

  try {
    await setHasCompletedLogsOnboarding(projectSlug);
    return redirect(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);
  } catch (error: any) {
    throw new Response(error.message, { status: 500 });
  }
};
