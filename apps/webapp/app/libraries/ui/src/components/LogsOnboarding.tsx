import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Form } from "@remix-run/react";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
import type { LoaderData } from "~/routes/__app/workspaces/$workspaceSlug/projects/$projectSlug/home";
import { Spinner } from "../../../common/src/components/Spinner";
import { SecondaryA } from "./Buttons/Buttons";
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
  const copyCode1 = `npm install apihero-js@latest`;
  const copyCode2 = `import { setupProxy } from "apihero-js/node";`;
  const copyCode4 = "npm exec apihero-js init public/";
  const copyCode3 = `setupProxy({ projectKey: “${projectId}” }).start();`;
  const inlineCode =
    "px-1 py-0.5 bg-slate-200 border border-slate-300 rounded text-slate-700";
  const tip =
    "bg-yellow-100 border border-yellow-300 font-semibold text-xs text-orange-400 rounded px-1.5 py-1 uppercase tracking-wider";

  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 mb-4 mr-4">
      <div className="bg-slate-100 p-4 border border-slate-200 rounded-md">
        <h2 className="font-semibold text-xl mb-4 text-slate-600">
          Get started
        </h2>
        <ul className="flex flex-col gap-5">
          <li className="flex gap-2">
            <span className={classNames(listItemNumbered)}>1</span>
            <div className="flex flex-col gap-2 w-full">
              <p className="text-sm text-slate-700">
                Install the <code className={inlineCode}>apihero-js</code>{" "}
                package. <span className={tip}>Tip:</span> You can swap{" "}
                <code className={inlineCode}>npm</code> for{" "}
                <code className={inlineCode}>yarn</code> or{" "}
                <code className={inlineCode}>pnpm</code> if you prefer.
              </p>
              <div className={codeContainer}>
                {copyCode1}
                <CopyTextButton value={copyCode1} variant="blue" />
              </div>
            </div>
          </li>
          <li className="flex gap-2">
            <span className={classNames(listItemNumbered)}>2</span>
            <div className="flex flex-col gap-2 w-full">
              <p className="text-sm text-slate-700">
                Import the <code className={inlineCode}>setupProxy</code>{" "}
                function.
              </p>
              <div className={codeContainer}>
                {copyCode2}
                <CopyTextButton value={copyCode2} variant="blue" />
              </div>
            </div>
          </li>
          <li className="flex gap-2">
            <span className={classNames(listItemNumbered)}>2</span>
            <div className="flex flex-col gap-2 w-full">
              <p className="text-sm text-slate-700">
                Install the Service Worker to forward specified traffic through
                a proxy server. <span className={tip}>Tip:</span> This command
                works for Next.js, Create React App, Vue.js, Ember.js, Svelte
                and Vite. For other frameworks view{" "}
                <a
                  href="https://docs.apihero.run/react-quick-start#2-install-the-worker"
                  rel="noreferrer"
                  target="_blank"
                  className="underline hover:text-slate-900"
                >
                  this table
                </a>
                .
              </p>
              <div className={codeContainer}>
                {copyCode4}
                <CopyTextButton value={copyCode4} variant="blue" />
              </div>
            </div>
          </li>
          <li className="flex gap-2">
            <span className={classNames(listItemNumbered)}>3</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">
                Configure the Service Worker with your project key.{" "}
                <span className={tip}>Tip:</span> Although it may seem unsafe,
                it is okay to put the projectKey in your code. This just
                identifies your project and is not a secret.
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
                <CountdownToRefreshButton projectId={projectId} />
              </div>
            </div>
          </li>
        </ul>
      </div>
      <HavingTroublePanel />
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
    <div className="grid grid-cols-[1fr_auto] gap-4 mb-4 mr-4">
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
      <HavingTroublePanel />
    </div>
  );
}

export const logCheckingInterval = 5000;

export function CountdownToRefreshButton({ projectId }: { projectId: string }) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [countdown, setCountdown] = useState(logCheckingInterval / 1000);

  const refreshTime = useCallback(() => {
    const elapsed = new Date().getTime() - lastUpdated.getTime();
    const remaining = Math.round((logCheckingInterval - elapsed) / 1000);

    if (remaining < 0) {
      fetch(`/api/projects/${projectId}/check-logs-onboarding`)
        .then(async (response) => {
          const data = await response.json();

          if (data.hasLogs) {
            window.location.reload();
          } else {
            setLastUpdated(new Date());
            setCountdown(logCheckingInterval / 1000);
          }
        })
        .catch(() => {
          setLastUpdated(new Date());
          setCountdown(logCheckingInterval / 1000);
        });
    } else {
      setCountdown(remaining);
    }
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
        {countdown === 0 ? (
          <>Checking for requests...</>
        ) : (
          <>Checking again in {countdown}</>
        )}
      </p>
    </div>
  );
}

function HavingTroublePanel() {
  return (
    <div className="bg-blue-50 w-80 border border-blue-100 rounded-md text-slate-700 p-4">
      <h3 className="text-xl font-semibold mb-2">Having trouble?</h3>
      <p className="mb-2 text-sm">
        If you're having trouble getting API Hero setup in your project, please
        get in touch with us below and we'll happily get you up and running.
      </p>
      <SecondaryA href="mailto:hello@apihero.run" className="mb-2">
        <EnvelopeIcon className="h-4 w-4 -ml-1" />
        Send us an email
      </SecondaryA>
      <SecondaryA
        target="_blank"
        href="https://cal.com/team/apihero/product-feedback"
        className="mb-3"
      >
        <PhoneIcon className="h-4 w-4 -ml-1" />
        Schedule a call
      </SecondaryA>
      <p className="mb-1 text-sm">
        Or read more about how it all works in our documentation.
      </p>
      <SecondaryA href="https://docs.apihero.run" target="_blank">
        <ArrowTopRightOnSquareIcon className="h-4 w-4 -ml-1" />
        Documentation
      </SecondaryA>
    </div>
  );
}
