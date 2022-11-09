import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getProjectFromSlugs } from "~/models/project.server";
import { requireUserId } from "~/services/session.server";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { CopyTextButton } from "~/libraries/ui/src/components/Buttons/CopyTextButton";
import { Outlet } from "@remix-run/react";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  PrimaryA,
  PrimaryLink,
  SecondaryButton,
  SecondaryLink,
} from "~/libraries/ui/src/components/Buttons/Buttons";
import classNames from "classnames";
import type { Log } from "internal-logs";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";
import { Spinner } from "~/libraries/common/src/components/Spinner";
import { StyledTabs } from "~/libraries/common";
import { Tab } from "@headlessui/react";

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

  let logs: Log[] = [];

  const url = `${logsOrigin}/logs/${project.id}?days=10000&page=1`;
  const logsResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authenticationToken}`,
    },
  });

  if (logsResponse.ok) {
    const json = await logsResponse.json();
    logs = json.logs;
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
      <Onboarding project={data.project} logs={data.logs} />
      {/* TODO: make below components that can be greyed out */}
      {/* <Filters/> */}
      {/* <Tab /> */}
      <Tab.Group defaultIndex={1}>
        <StyledTabs.UnderlinedList>
          <StyledTabs.Underlined>Dashboard</StyledTabs.Underlined>
          <StyledTabs.Underlined>Logs</StyledTabs.Underlined>
        </StyledTabs.UnderlinedList>
      </Tab.Group>
      <Outlet />
    </main>
  );
}

const listItemNumbered =
  "inline-flex text-slate-600 -mt-0.5 h-6 w-6 text-sm bg-white p-2 items-center justify-center rounded border border-slate-200";
const listItemCompleted =
  "inline-flex text-white -mt-0.5 h-6 w-6 text-sm bg-green-500 items-center justify-center rounded border border-green-600";
const codeConatiner =
  "flex items-center font-mono justify-between gap-2.5 rounded-md border bg-slate-700 py-2 pl-4 pr-2 text-sm text-white";
const codeExample = "Code sample to configure your monitoring";

function Onboarding({ project, logs }: UseDataFunctionReturn<typeof loader>) {
  const copyCode =
    "apihero({ platform: “node”, projectKey: “" + project.id + "” });";

  return (
    <div className="w-full flex gap-2">
      <div className="w-full bg-slate-100 p-4 border border-slate-200 rounded-md">
        <div className="flex gap-2.5 items-center mb-4 ml-0.5">
          <Spinner />
          <h2 className="font-semibold text-xl text-slate-600">Get started</h2>
        </div>
        <ul className="flex flex-col gap-5">
          {logs.length > 0 ? (
            <>
              <li className="flex gap-2">
                <span className={classNames(listItemCompleted)}>
                  <CheckIcon className="h-4 w-4" />
                </span>
                <p className="text-sm text-slate-700">
                  Copy paste the code into your project.
                </p>
              </li>
              <li className="flex gap-2">
                <span className={classNames(listItemCompleted)}>
                  <CheckIcon className="h-4 w-4" />
                </span>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-slate-700">
                    Send any API request from your project, then return here to
                    your dashboard and refresh.
                  </p>
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="flex gap-2">
                <span className={classNames(listItemNumbered)}>1</span>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-slate-700">
                    Copy paste the code into your project.
                  </p>
                  <div className={codeConatiner}>
                    {copyCode}
                    <CopyTextButton value={copyCode} variant="blue" />
                  </div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className={classNames(listItemNumbered)}>2</span>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-slate-700">
                    Send any API request from your project, then return here to
                    your dashboard and refresh.
                  </p>
                  <div className="flex items-center gap-4">
                    <PrimaryLink to="/">
                      <ArrowPathIcon className="h-4 w-4 -ml-1" />
                      Refresh
                    </PrimaryLink>
                    <span className="text-slate-400 text-xs">
                      Last refreshed 20 minutes ago
                    </span>
                  </div>
                </div>
              </li>
            </>
          )}

          <li className="flex gap-2">
            <span className={classNames(listItemNumbered)}>3</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Configure what API traffic you want to monitor (optional). Use
                the example below or view the docs.
              </p>
              <div className={codeConatiner}>
                {codeExample}
                <CopyTextButton value={codeExample} variant="blue" />
              </div>
              <PrimaryA href="https://docs.apihero.run" target="_blank">
                <ArrowTopRightOnSquareIcon className="h-4 w-4 -ml-1" />
                Documentation
              </PrimaryA>
            </div>
          </li>
          <li className="flex gap-2">
            <span className={classNames(listItemNumbered)}>4</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Add caching to speed up requests and save money (optional).
              </p>
              <PrimaryLink to="caching">
                <BoltIcon className="h-4 w-4 -ml-1" />
                Add caching
              </PrimaryLink>
            </div>
          </li>
        </ul>
      </div>
      {logs.length == 0 ? (
        <div className="bg-blue-50 w-80 border border-blue-100 rounded-md text-slate-700 p-4">
          <h3 className="text-xl font-semibold mb-2">No project yet?</h3>
          <p className="mb-1 text-sm">
            Check out a live demo to see API Hero in action.
          </p>
          <SecondaryLink to="/" target="_blank" className="mb-4">
            <ArrowTopRightOnSquareIcon className="h-4 w-4 -ml-1" />
            View in Code Sandbox
          </SecondaryLink>
          <p className="mb-1 text-sm">
            Or read more about how it all works in our documentation.
          </p>
          <SecondaryLink to="https://docs.apihero.run" target="_blank">
            <ArrowTopRightOnSquareIcon className="h-4 w-4 -ml-1" />
            Documentation
          </SecondaryLink>
        </div>
      ) : (
        <SecondaryButton className=" self-start ">Dismiss</SecondaryButton>
      )}
    </div>
  );
}
