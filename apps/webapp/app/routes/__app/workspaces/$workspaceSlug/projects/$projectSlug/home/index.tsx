import type { LoaderArgs } from "@remix-run/server-runtime";
import { redirect, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";
import dashboardDisabled from "~/libraries/images/ui/dashboard-disabled.png";
import { getProjectFromSlugs } from "~/models/project.server";
import { hasLogsInProject } from "~/services/logs.server";
import { requireUserId } from "~/services/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request);
  const { projectSlug, workspaceSlug } = params;
  invariant(workspaceSlug, "workspaceSlug not found");
  invariant(projectSlug, "projectSlug not found");

  const project = await getProjectFromSlugs({
    workspaceSlug,
    slug: projectSlug,
  });
  invariant(project, "project not found");

  const hasLogs = await hasLogsInProject(project.id);

  if (hasLogs) {
    return redirect(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/home/logs`
    );
  }

  return typedjson({ project });
};

export default function PlaceholderDashboard() {
  return (
    <div className="overflow-hidden">
      <img src={dashboardDisabled} alt="Placeholder dashboard" />
    </div>
  );
}
