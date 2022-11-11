import type { ActionFunction } from "@remix-run/server-runtime";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";
import { setHasCompletedLogsOnboarding } from "~/models/project.server";

export const action: ActionFunction = async ({ request, params }) => {
  const { projectId } = params;
  invariant(projectId, "projectId is required");

  try {
    await setHasCompletedLogsOnboarding(projectId);
    return typedjson({ success: true });
  } catch (error) {
    return typedjson({ success: false, error: JSON.stringify(error) });
  }
};
