import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getProjectFromSlugs } from "~/models/project.server";
import { requireUserId } from "~/services/session.server";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Outlet, useParams } from "@remix-run/react";
import type { GetLogsSuccessResponse } from "internal-logs";
import { LogsOnboarding } from "~/libraries/ui/src/components/LogsOnboarding";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";

export type LoaderData = UseDataFunctionReturn<typeof loader>;

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request);
  const { projectSlug, workspaceSlug } = params;
  invariant(workspaceSlug, "workspaceSlug not found");
  invariant(projectSlug, "projectSlug not found");

  const project = await getProjectFromSlugs({
    workspaceSlug,
    slug: projectSlug,
  });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const logsOrigin = process.env.LOGS_ORIGIN;
  invariant(logsOrigin, "LOGS_ORIGIN env variables not defined");
  const authenticationToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
  invariant(
    authenticationToken,
    "LOGS_API_AUTHENTICATION_TOKEN env variables not defined"
  );

  let logs: GetLogsSuccessResponse | undefined = undefined;

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const searchObject = Object.fromEntries(searchParams.entries());

  if (searchObject.page === undefined) {
    searchParams.set("page", "1");
  }
  if (searchObject.days === undefined && searchObject.start === undefined) {
    searchParams.set("days", "7");
  }

  const apiUrl = `${logsOrigin}/logs/${project.id}?${searchParams.toString()}`;

  try {
    const logsResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`,
      },
    });

    if (logsResponse.ok && logsResponse.status === 200) {
      const json = await logsResponse.json();
      logs = json;
    }

    return typedjson({ project, logs });
  } catch (error) {
    console.error(error);
    return typedjson({ project, logs });
  }
};

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();
  const { workspaceSlug } = useParams();

  return (
    <main className="h-mainMobileContainerHeight xl:h-mainDesktopContainerHeight w-full bg-slate-50 py-4 pl-4">
      <LogsOnboarding
        project={data.project}
        logs={data.logs}
        workspaceSlug={workspaceSlug ?? ""}
      />
      <Outlet />
    </main>
  );
}
