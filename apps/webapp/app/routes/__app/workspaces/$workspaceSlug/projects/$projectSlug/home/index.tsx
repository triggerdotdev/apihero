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
            <p className="text-sm font-medium text-slate-600">Project Key:</p>
            <div className="flex items-center gap-2.5 rounded border bg-white py-1 pl-3 pr-1 text-sm text-slate-600">
              {data.project.id}
              <CopyTextButton value={data.project.id} />
            </div>
          </div>
          <p className="text-sm text-slate-600">
            View our
            <a
              href="https://docs.apihero.run"
              target="_blank"
              className="underline transition hover:text-blue-500"
              rel="noreferrer"
            >
              getting started
            </a>
            guide
          </p>
        </div>

        {/* {data.project.httpClients ? (
          <>
            <ClientsList
              clients={data.project.httpClients}
              endpointStats={data.project.endpointStats}
            />
          </>
        ) : (
          <BlankState />
        )} */}
      </main>
    </div>
  );
}
