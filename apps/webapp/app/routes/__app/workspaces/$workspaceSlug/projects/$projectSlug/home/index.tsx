import type { ActionFunction, LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getProjectFromSlugs } from "~/models/project.server";
import { requireUserId } from "~/services/session.server";
import { getSecurityRequirementsForIntegration } from "~/models/security.server";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";
import type { EndpointStats } from "~/models/httpEndpoint.server";
import { getStatsById } from "~/models/httpEndpoint.server";
import { z } from "zod";
import { setCache as updateCacheSettings } from "~/models/httpClient.server";
import { syncIntegrationsSettingsWithGateway } from "~/models/gateway.server";
import { CopyTextButton } from "~/libraries/ui/src/components/CopyTextButton";
import { Outlet } from "@remix-run/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "~/libraries/ui/src/components/Buttons/Button";
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
    <main className="h-full w-full bg-slate-50 p-4">
      {data.project.httpClients ? (
        <>
          <OnboardingIncomplete />
        </>
      ) : (
        <>
          <OnboardingComplete />
          <Outlet />
        </>
      )}
    </main>
  );
}

function OnboardingIncomplete() {
  const data = useTypedLoaderData<typeof loader>();

  return (
    <div className="w-full flex gap-2">
      <div className="w-full bg-slate-100 border border-slate-200 rounded-md">
        <ul>
          <li className="flex flex-col">
            <p className="text-sm text-slate-700">
              Copy paste the code into your project:
            </p>
            <div className="flex items-center gap-2.5 rounded border bg-white py-1 pl-3 pr-1 text-sm text-slate-600">
              {data.project.id}
              <CopyTextButton value={data.project.id} />
            </div>
          </li>
        </ul>
      </div>
      <div className="bg-blue-50 w-80 border border-blue-100 rounded-md text-slate-700 p-4">
        <h3 className="text-xl font-semibold mb-2">No project yet?</h3>
        <p className="mb-1 text-sm">
          Check out a live demo to see API Hero in action.
        </p>
        <Button
          color="slate"
          variant="solid"
          href="/"
          target="_blank"
          className="mb-4"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4 -ml-1" />
          View in Code Sandbox
        </Button>
        <p className="mb-1 text-sm">
          Or read more about how it all works in our documentation.
        </p>
        <Button
          color="slate"
          variant="solid"
          href="https://docs.apihero.run"
          target="_blank"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4 -ml-1" />
          Documentation
        </Button>
      </div>
    </div>
  );
}

function OnboardingComplete() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex items-center justify-center"></div>
      <div className="text-center">
        <p className="text-xl font-medium text-slate-600">
          You have no HTTP clients yet
        </p>
        <p className="text-sm text-slate-400 mt-2">
          HTTP clients are the entry point to your API. You can create one by
          clicking the button below.
        </p>
      </div>
    </div>
  );
}
