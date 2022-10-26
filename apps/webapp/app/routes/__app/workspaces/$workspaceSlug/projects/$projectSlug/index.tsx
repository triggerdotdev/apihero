import type { ActionFunction, LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getProjectFromSlugs } from "~/models/project.server";
import { requireUserId } from "~/services/session.server";
import { AuthenticationSummary } from "~/libraries/ui/src/components/client/AuthenticationSummary";
import { getSecurityRequirementsForIntegration } from "~/models/security.server";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";
import { NavLink } from "@remix-run/react";
import {
  ChevronRightIcon,
  LockClosedIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import { HTTPMethodLabel } from "~/libraries/common/src/components/HTTPMethod";
import { DataUptime } from "~/libraries/ui/src/components/DataUptime";
import { DataErrorCount } from "~/libraries/ui/src/components/DataErrorCount";
import { DataAvgDuration } from "~/libraries/ui/src/components/DataAvgDuration";
import { AuthenticationBadges } from "~/libraries/common/src/components/AuthenticationBadges";
import type { EndpointStats } from "~/models/httpEndpoint.server";
import { getStatsById } from "~/models/httpEndpoint.server";
import { CachingOptions } from "~/libraries/ui/src/components/client/CachingOptions";
import { z } from "zod";
import { setCache as updateCacheSettings } from "~/models/httpClient.server";
import { syncIntegrationsSettingsWithGateway } from "~/models/gateway.server";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { CopyTextButton } from "~/libraries/ui/src/components/CopyTextButton";
type LoaderData = UseDataFunctionReturn<typeof loader>;

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request);
  const { projectSlug, workspaceSlug } = params;
  invariant(workspaceSlug, "workspaceSlug not found");
  invariant(projectSlug, "projectSlug not found");

  const project = await loadProject(workspaceSlug, projectSlug);
  return typedjson({ project });
};

async function loadProject(workspaceSlug: string, projectSlug: string) {
  const project = await getProjectFromSlugs({
    workspaceSlug,
    slug: projectSlug,
  });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const clientsWithSecurity = await Promise.all(
    project.httpClients.map(async (client) => {
      const securityOptions = await getSecurityRequirementsForIntegration(
        client.integration.id
      );
      return {
        ...client,
        securityOptions,
      };
    })
  );

  const endpointStats: Record<string, EndpointStats> = {};

  const allEndpoints = project.httpClients.flatMap(
    (client) => client.endpoints
  );

  const endpointPromises: Array<Promise<void>> = [];

  for (const endpoint of allEndpoints) {
    endpointPromises.push(
      (async () => {
        const stats = await getStatsById(endpoint.id);

        endpointStats[endpoint.id] = stats;
      })()
    );
  }

  await Promise.all(endpointPromises);

  return { ...project, httpClients: clientsWithSecurity, endpointStats };
}

export type ActionData = {
  errors?: {
    enabled?: { _errors: string[] };
    time?: { _errors: string[] };
    other?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const { workspaceSlug, projectSlug } = params;
  invariant(workspaceSlug, "workspaceSlug not found");
  invariant(projectSlug, "projectSlug not found");

  const formData = await request.formData();

  const toggleFormSchema = z.object({
    type: z.literal("toggle"),
    enabled: z.preprocess((a) => (a as string) === "true", z.boolean()),
    clientId: z.string(),
  });
  const updateTimeSchema = z.object({
    type: z.literal("updateTime"),
    time: z.preprocess(
      (a) => parseFloat(a as string),
      z.number().positive().min(0)
    ),
    clientId: z.string(),
  });
  const schema = z.discriminatedUnion("type", [
    toggleFormSchema,
    updateTimeSchema,
  ]);

  const result = schema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return typedjson(
      {
        errors: result.error.format(),
      },
      { status: 400 }
    );
  }

  if (result.data.type === "toggle") {
    await updateCacheSettings({
      clientId: result.data.clientId,
      enabled: result.data.enabled,
    });
  } else {
    await updateCacheSettings({
      clientId: result.data.clientId,
      enabled: true,
      ttl: result.data.time,
    });
  }

  await syncIntegrationsSettingsWithGateway({
    workspaceSlug,
    projectSlug,
    clientId: result.data.clientId,
  });

  return typedjson({});
};

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 px-10 py-6">
      <main className="m-auto h-full w-full">
        <div className="flex items-center justify-between pb-8">
          <div className="flex items-center">
            <p className="text-sm font-medium text-slate-600">
              Project Key: &nbsp;{" "}
            </p>
            <div className="flex items-center gap-2.5 rounded border bg-white py-1 pl-3 pr-1 text-sm text-slate-600">
              {data.project.id}
              <CopyTextButton value={data.project.id} />
            </div>
          </div>
          <p className="text-sm text-slate-600">
            View our{" "}
            <a
              href="https://docs.apihero.run"
              target="_blank"
              className="underline transition hover:text-blue-500"
              rel="noreferrer"
            >
              getting started
            </a>{" "}
            guide
          </p>
        </div>

        {data.project.httpClients ? (
          <>
            <ClientsList
              clients={data.project.httpClients}
              endpointStats={data.project.endpointStats}
            />
          </>
        ) : (
          <BlankState />
        )}
      </main>
    </div>
  );
}

type ClientsListProps = {
  clients: LoaderData["project"]["httpClients"];
  endpointStats: LoaderData["project"]["endpointStats"];
};

function ClientsList({ clients, endpointStats }: ClientsListProps) {
  return (
    <>
      {clients.map((client) => {
        return (
          <div key={client.id} className="mb-6 last:mb-20">
            <div className="mb-1 flex flex-col items-baseline gap-3">
              <div className="flex items-baseline justify-center gap-2">
                <h3 className="text-2xl font-semibold capitalize text-slate-800">
                  {client.integration.name}
                </h3>
                {client.integration.officialDocumentation && (
                  <a
                    href={client.integration.officialDocumentation}
                    target="_blank"
                    className="flex gap-1 text-sm text-slate-600 underline transition hover:text-blue-500"
                    rel="noreferrer"
                  >
                    <span>Official docs</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="mt-0.5 h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                )}
              </div>
              <p className="mb-2 text-base text-slate-500">
                {client.integration.description}
              </p>
            </div>
            <div className="grid grid-cols-[minmax(300px,_2fr)_minmax(300px,_1fr)] gap-4">
              <div className="flex flex-col gap-2">
                <ul className="flex flex-col gap-2">
                  {client.endpoints.length > 0 ? (
                    client.endpoints.map((endpoint) => {
                      return (
                        <li key={endpoint.id}>
                          <NavLink
                            to={`${client.integration.slug}/${endpoint.operation.method}/${endpoint.operation.operationId}`}
                            className="group flex items-center justify-between rounded-lg bg-white p-6 pt-5 shadow transition hover:shadow-md"
                          >
                            <div className="w-full">
                              <div className="mb-2 flex flex-wrap items-start justify-between font-medium text-slate-400">
                                <div className="flex flex-col">
                                  <h3 className="mb-1 text-2xl tracking-tight text-slate-700">
                                    {endpoint.operation.summary}
                                  </h3>
                                  <div>
                                    <HTTPMethodLabel
                                      method={endpoint.operation.method}
                                      className="text-lg font-semibold"
                                    />
                                    <span className="ml-1 font-mono text-lg text-slate-700">
                                      {endpoint.operation.path.path}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DataEndpointStats
                                    id={endpoint.id}
                                    stats={endpointStats}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {endpoint.operation.securityOptional ? (
                                  <p className="text-sm text-slate-600">
                                    Security optional:
                                  </p>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <LockClosedIcon className="h-4 w-4 text-slate-600" />
                                    <p className="text-sm text-slate-600">
                                      Security required:
                                    </p>
                                  </div>
                                )}
                                <AuthenticationBadges
                                  securityRequirements={
                                    endpoint.operation.securityRequirements
                                  }
                                />
                              </div>
                            </div>
                            <ChevronRightIcon
                              className="ml-6 h-7 w-7 flex-shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-400"
                              aria-hidden="true"
                            />
                          </NavLink>
                        </li>
                      );
                    })
                  ) : (
                    <NoEndpointsBlankState />
                  )}
                </ul>
              </div>
              <div className="flex max-w-lg flex-col gap-6">
                <AuthenticationSummary
                  active={client.authentications}
                  integration={client.integration}
                />
                <CachingOptions
                  origin={client.integration.currentSchema?.servers[0].url}
                  client={client}
                />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function DataEndpointStats({
  id,
  stats,
}: {
  id: string;
  stats: LoaderData["project"]["endpointStats"];
}) {
  const stat = stats[id];

  if (!stat) {
    return null;
  }

  return (
    <ul className="flex gap-3">
      {typeof stat.successRatio24Hr === "number" && (
        <li className="flex">
          <DataUptime uptime={stat.successRatio24Hr} />
        </li>
      )}
      {typeof stat.errorCount === "number" && (
        <li className="flex">
          <DataErrorCount errorCount={stat.errorCount} />
        </li>
      )}
      {typeof stat.avgDuration === "number" && (
        <li className="flex">
          <DataAvgDuration avgDuration={stat.avgDuration} />
        </li>
      )}
    </ul>
  );
}

function BlankState() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">No Endpoints</h1>
    </div>
  );
}

function NoEndpointsBlankState() {
  return (
    <a
      href="https://docs.apihero.run/react-quick-start#3-create-your-first-endpoint-hook"
      target="_blank"
      className="group flex items-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-4 pl-4 pr-6 shadow-none transition hover:border-solid hover:border-transparent hover:bg-white hover:shadow-md"
      rel="noreferrer"
    >
      <div className="flex w-full flex-col justify-between gap-2">
        <div className="flex items-center gap-1">
          <PlusCircleIcon className="h-6 w-6 text-emerald-500" />
          <h3 className="text-xl font-semibold">Add your first endpoint</h3>
        </div>
        <p className="text-base text-slate-500">
          Follow the Getting Started guide to add your first endpoint.
        </p>
      </div>
      <ArrowTopRightOnSquareIcon className="h-7 w-7 text-slate-500 transition group-hover:text-slate-700" />
    </a>
  );
}
