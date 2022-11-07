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
import {
  ArrowLeftCircleIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { Button } from "~/libraries/ui/src/components/Buttons/Button";
import classNames from "classnames";
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
  const numberedItem =
    "inline-flex text-slate-600 -mt-0.5 h-6 w-6 text-sm bg-white p-2 items-center justify-center rounded border border-slate-200";
  const data = useTypedLoaderData<typeof loader>();
  const codeExample = "Code sample to configure your monitoring";

  return (
    <div className="w-full flex gap-2">
      <div className="w-full bg-slate-100 p-4 border border-slate-200 rounded-md">
        <div className="flex gap-2.5 items-center mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin"
          >
            <rect
              x="2"
              y="2"
              width="16"
              height="16"
              rx="8"
              stroke="#BBF7D0"
              strokeWidth="3"
            />
            <path
              d="M10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2"
              stroke="#22C55E"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <h2 className="font-semibold text-xl text-slate-600">Get started</h2>
        </div>
        <ul className="flex flex-col gap-5">
          <li className="flex gap-2">
            <span className={classNames(numberedItem)}>1</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Copy paste the code into your project.
              </p>
              <div className="flex items-center gap-2.5 rounded border bg-slate-700 py-1 pl-3 pr-1 text-sm text-white">
                {data.project.id}
                <CopyTextButton value={data.project.id} />
              </div>
            </div>
          </li>
          <li className="flex gap-2">
            <span className={classNames(numberedItem)}>2</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Send any API request from your project, then return here to your
                dashboard and refresh.
              </p>
              <div className="flex items-center gap-4">
                <Button color="blue" variant="solid" href="/" target="_blank">
                  <ArrowPathIcon className="h-4 w-4 -ml-1" />
                  Refresh
                </Button>
                <span className="text-slate-400 text-xs">
                  Last refreshed 20 minutes ago
                </span>
              </div>
            </div>
          </li>
          <li className="flex gap-2">
            <span className={classNames(numberedItem)}>3</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Configure what API traffic you want to monitor (optional). Use
                the example below or view the docs.
              </p>
              <div className="flex items-center font-mono justify-between gap-2.5 rounded border bg-slate-700 py-1 pl-3 pr-1 text-sm text-white">
                {codeExample}
                <CopyTextButton
                  value={codeExample}
                  className="bg-blue-500 rounded text-white"
                />
              </div>
              <Button
                color="blue"
                variant="solid"
                href="https://docs.apihero.run"
                target="_blank"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4 -ml-1" />
                Documentation
              </Button>
            </div>
          </li>
          <li className="flex gap-2">
            <span className={classNames(numberedItem)}>4</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Add caching to speed up requests and save money (optional).
              </p>
              <Button color="blue" variant="solid" to="caching" target="_blank">
                <BoltIcon className="h-4 w-4 -ml-1" />
                Add caching
              </Button>
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
