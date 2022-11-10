import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getProjectFromSlugs } from "~/models/project.server";
import { requireUserId } from "~/services/session.server";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Link, Outlet } from "@remix-run/react";
import type { GetLogsSuccessResponse } from "internal-logs";
import { StyledTabs } from "~/libraries/common";
import { Tab } from "@headlessui/react";
import { LogsOnboarding } from "~/libraries/ui/src/components/LogsOnboarding";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";
import classnames from "classnames";

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

  const url = `${logsOrigin}/logs/${project.id}?days=10000&page=1`;
  const logsResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authenticationToken}`,
    },
  });

  if (logsResponse.ok && logsResponse.status === 200) {
    const json = await logsResponse.json();
    logs = json;
  }

  return typedjson({ project, logs });
};

export type ActionData = {
  errors?: {
    enabled?: { _errors: string[] };
    time?: { _errors: string[] };
    other?: string;
  };
};

// export const action: ActionFunction = async ({ request, params }) => {
//   const { workspaceSlug, projectSlug } = params;
//   invariant(workspaceSlug, "workspaceSlug not found");
//   invariant(projectSlug, "projectSlug not found");

//   const formData = await request.formData();

//   const toggleFormSchema = z.object({
//     type: z.literal("toggle"),
//     enabled: z.preprocess((a) => (a as string) === "true", z.boolean()),
//     clientId: z.string(),
//   });
//   const updateTimeSchema = z.object({
//     type: z.literal("updateTime"),
//     time: z.preprocess(
//       (a) => parseFloat(a as string),
//       z.number().positive().min(0)
//     ),
//     clientId: z.string(),
//   });
//   const schema = z.discriminatedUnion("type", [
//     toggleFormSchema,
//     updateTimeSchema,
//   ]);

//   const result = schema.safeParse(Object.fromEntries(formData));

//   if (!result.success) {
//     return typedjson(
//       {
//         errors: result.error.format(),
//       },
//       { status: 400 }
//     );
//   }

//   if (result.data.type === "toggle") {
//     await updateCacheSettings({
//       clientId: result.data.clientId,
//       enabled: result.data.enabled,
//     });
//   } else {
//     await updateCacheSettings({
//       clientId: result.data.clientId,
//       enabled: true,
//       ttl: result.data.time,
//     });
//   }

//   await syncIntegrationsSettingsWithGateway({
//     workspaceSlug,
//     projectSlug,
//     clientId: result.data.clientId,
//   });

//   return typedjson({});
// };

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  return (
    <main className="h-mainMobileContainerHeight xl:h-mainDesktopContainerHeight overflow-y-auto overflow-hidden w-full bg-slate-50 p-4">
      <LogsOnboarding project={data.project} logs={data.logs} />
      {/* TODO: make below components that can be greyed out */}
      {/* <Filters/> */}
      {/* <Tab /> */}

      <Outlet />
    </main>
  );
}
