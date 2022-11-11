import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  CheckIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";
import { Form } from "@remix-run/react";
import classNames from "classnames";
import type { LoaderData } from "~/routes/__app/workspaces/$workspaceSlug/projects/$projectSlug/home";
import { SecondaryButton } from "../../../common";
import { Spinner } from "../../../common/src/components/Spinner";
import {
  PrimaryLink,
  PrimaryA,
  SecondaryLink,
  PrimaryButton,
} from "./Buttons/Buttons";
import { CopyTextButton } from "./Buttons/CopyTextButton";

const listItemNumbered =
  "inline-flex text-slate-600 -mt-0.5 h-6 w-6 text-sm bg-white p-2 items-center justify-center rounded border border-slate-200";
const listItemCompleted =
  "inline-flex text-white -mt-0.5 h-6 w-6 text-sm bg-green-500 items-center justify-center rounded border border-green-600";
const codeConatiner =
  "flex items-center font-mono justify-between gap-2.5 rounded-md border bg-slate-700 py-2 pl-4 pr-2 text-sm text-white";

export function LogsOnboarding({
  project,
  logs,
  workspaceSlug,
}: LoaderData & { workspaceSlug: string }) {
  return (
    <>
      {!project.hasLogs && <OnboardingIncomplete projectId={project.id} />}
      {project.hasLogs && !project.hasCompletedOnboarding && (
        <OnboardingComplete
          workspaceSlug={workspaceSlug}
          projectSlug={project.slug}
          projectId={project.id}
        />
      )}

      {/* <div className="w-full flex gap-2">
        <div className="w-full bg-slate-100 p-4 border border-slate-200 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2.5 items-center mb-4 ml-0.5">
                {project.hasLogs ? (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <Spinner />
                )}

                <h2 className="font-semibold text-xl text-slate-600">
                  Get started
                </h2>
              </div>

              <ul className="flex flex-col gap-5">
                {project.hasLogs ? (
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
                          Send any API request from your project, then return
                          here to your dashboard and refresh.
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
                          Send any API request from your project, then return
                          here to your dashboard and refresh.
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
                      Configure what API traffic you want to monitor (optional).
                      Use the example below or view the docs.
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
                      Add caching to speed up requests and save money
                      (optional).
                    </p>
                    <PrimaryLink to="../caching">
                      <BoltIcon className="h-4 w-4 -ml-1" />
                      Add caching
                    </PrimaryLink>
                  </div>
                </li>
              </ul>
            </div>
            {project.hasLogs ? null : (
              <SecondaryButton>Dismiss</SecondaryButton>
            )}
          </div>
        </div>
        {!project.hasLogs ? (
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
        ) : null}
      </div> */}
    </>
  );
}

function OnboardingIncomplete({ projectId }: { projectId: string }) {
  const copyCode =
    "apihero({ platform: “node”, projectKey: “" + projectId + "” });";

  return (
    <div className="flex gap-2">
      <div className="bg-slate-100 flex-grow p-4 border border-slate-200 rounded-md mb-4">
        <div className="flex gap-2.5 items-center mb-4 ml-0.5">
          <Spinner />
          <h2 className="font-semibold text-xl text-slate-600">Get started</h2>
        </div>
        <ul className="flex flex-col gap-5">
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
                Send any API request from your project, then return here to your
                dashboard and refresh.
              </p>
              <div className="flex items-center gap-4">
                <PrimaryButton onClick={() => document.location.reload()}>
                  <ArrowPathIcon className="h-4 w-4 -ml-1" />
                  Refresh
                </PrimaryButton>
                <span className="text-slate-400 text-xs">
                  Last refreshed 20 minutes ago
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
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
    </div>
  );
}

function OnboardingComplete({
  workspaceSlug,
  projectSlug,
  projectId,
}: {
  workspaceSlug: string;
  projectSlug: string;
  projectId: string;
}) {
  const copyCode = `apihero({ projectKey: “${projectId}, allows: [“*.github.com”] });`;

  return (
    <>
      <div className="bg-green-100 flex-grow p-4 border border-slate-200 rounded-md mb-4">
        <div className="flex gap-2.5 items-center mb-4 ml-0.5">
          <CheckIcon className="h-5 w-5 text-green-500" />
          <h2 className="font-semibold text-xl text-slate-600">
            Awesome, setup complete!
          </h2>
        </div>
      </div>
      <div className="bg-slate-100 flex-grow p-4 border border-slate-200 rounded-md mb-4">
        <h2 className="font-semibold text-xl text-slate-600">
          Optional configuration: Choose which requests are proxied
        </h2>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-700">
            Configure what API traffic you want to monitor (optional). Use the
            example below or read the Link{" "}
            <a href="https://docs.apihero.run">full documentation</a>.
          </p>
          <div className={codeConatiner}>
            {copyCode}
            <CopyTextButton value={copyCode} variant="blue" />
          </div>
          <PrimaryA href="https://docs.apihero.run" target="_blank">
            <ArrowTopRightOnSquareIcon className="h-4 w-4 -ml-1" />
            Documentation
          </PrimaryA>
        </div>
        <Form
          method="post"
          action={`/resources/workspaces/${workspaceSlug}/projects/${projectSlug}/completed-logs-onboarding`}
        >
          <button type="submit">
            <XMarkIcon className="h-4 w-4 text-slate-600" />
          </button>
        </Form>
      </div>
    </>
  );
}
