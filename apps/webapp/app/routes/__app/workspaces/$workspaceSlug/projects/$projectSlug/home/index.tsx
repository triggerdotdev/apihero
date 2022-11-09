import type { LoaderArgs } from "@remix-run/server-runtime";
import { redirect, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";
import dashboardDisabled from "~/libraries/images/ui/dashboard-disabled.png";
import { getProjectFromSlugs } from "~/models/project.server";
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

  const logsOrigin = process.env.LOGS_ORIGIN;
  invariant(logsOrigin, "LOGS_ORIGIN env variables not defined");
  const authenticationToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
  invariant(
    authenticationToken,
    "LOGS_API_AUTHENTICATION_TOKEN env variables not defined"
  );

  const url = `${logsOrigin}/logs/${project.id}?days=10000&page=1`;

  try {
    const logsResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`,
      },
    });

    if (logsResponse.ok) {
      const json = await logsResponse.json();
      if (json.logs.length > 0) {
        return redirect(
          `/workspaces/${workspaceSlug}/projects/${projectSlug}/home/logs`
        );
      }
    }

    return typedjson({ project });
  } catch (error) {
    console.error(error);
    return typedjson({ project });
  }
};

export default function PlaceholderDashboard() {
  return (
    <div>
      <img src={dashboardDisabled} alt="Placeholder dashboard" />
    </div>
  );
}
