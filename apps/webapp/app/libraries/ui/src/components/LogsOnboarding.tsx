import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Form } from "@remix-run/react";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
import type { LoaderData } from "~/routes/__app/workspaces/$workspaceSlug/projects/$projectSlug/home";
import { Spinner } from "../../../common/src/components/Spinner";
import { CopyTextButton } from "./Buttons/CopyTextButton";

const listItemNumbered =
  "inline-flex text-slate-600 -mt-0.5 h-6 w-6 text-sm bg-white p-2 items-center justify-center rounded border border-slate-200";
const codeContainer =
  "flex items-center font-mono justify-between gap-2.5 rounded-md border bg-slate-700 py-2 pl-4 pr-2 text-sm text-white";

export function LogsOnboarding({
  project,
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
    </>
  );
}

function OnboardingIncomplete({ projectId }: { projectId: string }) {
  const copyCode1 = `npm install @apihero/js@latest`;
  const copyCode2 = `import { setupProxy } from "@apihero/js/node";`;
  const copyCode3 = `setupProxy({ projectKey: “${projectId}” }).start();`;

  return (
    <div className="grid grid-col-1 mb-4 mr-4">
      <div className="bg-slate-100 flex-grow p-4 border border-slate-200 rounded-md">
        <h2 className="font-semibold text-xl mb-4 text-slate-600">
          Get started
        </h2>
        <ul className="flex flex-col gap-5">
          <li className="flex gap-2">
            <span className={classNames(listItemNumbered)}>1</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Install the <code>@apihero/js</code> package.
              </p>
              <div className={codeContainer}>
                {copyCode1}
                <CopyTextButton value={copyCode1} variant="blue" />
              </div>
            </div>
          </li>
          <li className="flex gap-2">
            <span className={classNames(listItemNumbered)}>2</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Import the <code>setupProxy</code> function.
              </p>
              <div className={codeContainer}>
                {copyCode2}
                <CopyTextButton value={copyCode2} variant="blue" />
              </div>
            </div>
          </li>
          <li className="flex gap-2">
            <span className={classNames(listItemNumbered)}>3</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Setup the proxy with your project key.
              </p>
              <div className={codeContainer}>
                {copyCode3}
                <CopyTextButton value={copyCode3} variant="blue" />
              </div>
            </div>
          </li>
          <li className="flex gap-2">
            <span className={classNames(listItemNumbered)}>4</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Send any API request from your project, then come back here.
              </p>
              <div className="flex items-center gap-4">
                <CountdownToRefreshButton lastUpdated={new Date()} />
              </div>
            </div>
          </li>
        </ul>
      </div>
      {/* <div className="bg-blue-50 w-80 border border-blue-100 rounded-md text-slate-700 p-4 mr-4">
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
      </div> */}
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
  const copyCode = `setupProxy({ projectKey: “${projectId}", allow: ["https://api.github.com/*”] }).start();`;

  return (
    <div className="mb-5">
      <div className="bg-green-100 flex-grow p-4 border border-slate-200 rounded-md mb-4">
        <div className="flex gap-2.5 items-center ml-0.5">
          <CheckCircleIcon className="h-7 w-7 text-green-500" />
          <h2 className="font-semibold text-xl text-slate-600">
            Awesome, setup complete!
          </h2>
        </div>
      </div>
      <div className="bg-slate-100 flex gap-2 justify-between p-4 border border-slate-200 rounded-md mb-4">
        <div className="flex flex-col gap-y-2">
          <h2 className="font-semibold text-xl text-slate-600">
            Optional configuration
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-700">
              Choose which requests are proxied. Use the example below or read
              the{" "}
              <a
                href="https://docs.apihero.run"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-blue-500 transition"
              >
                full documentation
              </a>
              .
            </p>
            <div className={codeContainer}>
              {copyCode}
              <CopyTextButton value={copyCode} variant="blue" />
            </div>
          </div>
        </div>
        <Form
          method="post"
          action={`/resources/workspaces/${workspaceSlug}/projects/${projectSlug}/completed-logs-onboarding`}
        >
          <button
            type="submit"
            className="-mt-2 -mr-2 bg-transparent hover:bg-white border border-transparent hover:border-slate-300 transition rounded p-1"
          >
            <XMarkIcon className="h-5 w-5 text-slate-600" />
          </button>
        </Form>
      </div>
    </div>
  );
}

type RefreshButtonProps = {
  lastUpdated: Date;
};

export const logCheckingInterval = 5000;

export function CountdownToRefreshButton({ lastUpdated }: RefreshButtonProps) {
  const [countdown, setCountdown] = useState(logCheckingInterval / 1000);

  const refreshTime = useCallback(() => {
    const elapsed = new Date().getTime() - lastUpdated.getTime();
    const remaining = Math.round((logCheckingInterval - elapsed) / 1000);
    if (remaining <= 0) return;
    setCountdown(remaining);
  }, [lastUpdated]);

  useEffect(() => {
    const interval = setInterval(() => refreshTime(), 1000);
    return () => clearInterval(interval);
  }, [refreshTime]);

  return (
    <div className="flex justify-between bg-green-100 border border-green-200 pl-3 pr-4 py-3 w-full rounded">
      <div className="flex items-center gap-2">
        <Spinner />
        <p className="text-slate-600 text-sm">Listening for events…</p>
      </div>
      <p className="flex gap-2 items-center text-xs text-slate-600">
        Checking again in {countdown}
      </p>
    </div>
  );
}
