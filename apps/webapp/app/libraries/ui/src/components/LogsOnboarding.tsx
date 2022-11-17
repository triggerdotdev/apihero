import { Tab } from "@headlessui/react";
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Form } from "@remix-run/react";
import classNames from "classnames";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { StyledTabs } from "~/libraries/common";
import type { LoaderData } from "~/routes/__app/workspaces/$workspaceSlug/projects/$projectSlug/home";
import { Spinner } from "../../../common/src/components/Spinner";
import { SecondaryA } from "./Buttons/Buttons";
import { CopyTextButton } from "./Buttons/CopyTextButton";
import { Select } from "./Select";

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

const inlineCode =
  "px-1 py-0.5 bg-slate-200 border border-slate-300 rounded text-slate-700";
const tip =
  "bg-yellow-100 border border-yellow-300 font-semibold text-xs text-orange-400 rounded px-1.5 py-1 uppercase tracking-wider";

function OnboardingIncomplete({ projectId }: { projectId: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 mb-4 mr-4">
      <div className="bg-slate-100 p-4 border border-slate-200 rounded-md">
        <h2 className="font-semibold text-xl mb-4 text-slate-600">
          Get started
        </h2>

        <ul className="flex gap-2 mb-2">
          <Instruction step={1}>
            <p className="text-sm text-slate-700">Select your framework</p>
          </Instruction>
        </ul>

        <Tab.Group>
          <StyledTabs.SegmentedList
            className={"-mb-px flex flex-shrink-0 flex-grow-0"}
          >
            <div className="flex w-full flex-wrap-reverse justify-between border-b border-slate-200">
              <div className="flex max-w-fit">
                <StyledTabs.Underlined>Node</StyledTabs.Underlined>
                <StyledTabs.Segmented>Next.js</StyledTabs.Segmented>
                <StyledTabs.Underlined>React</StyledTabs.Underlined>
              </div>
            </div>
          </StyledTabs.SegmentedList>
          <Tab.Panels className="flex-grow overflow-y-auto pt-4">
            <Tab.Panel className="relative h-full">
              <NodeJs projectId={projectId} />
            </Tab.Panel>
            <Tab.Panel className="relative h-full">
              <NextJs projectId={projectId} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
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
              <CodeBlock code={copyCode} />
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
  }, [lastUpdated, projectId]);

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

function Instructions({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-5">{children}</ul>;
}

function Instruction({
  step,
  children,
}: {
  step: number;
  children: ReactNode;
}) {
  const classes =
    "inline-flex text-slate-600 -mt-0.5 h-6 w-6 text-sm bg-white p-2 items-center justify-center rounded border border-slate-200";

  return (
    <li className="flex gap-2">
      <span className={classNames(classes)}>{step}</span>
      <div className="flex flex-col gap-2 w-full">{children}</div>
    </li>
  );
}

function InstallPackage() {
  const code = `install apihero-js@latest`;

  return (
    <CommandLine step={2} code={code}>
      Install the <InlineCode>apihero-js</InlineCode> package.
    </CommandLine>
  );
}

function InstallServiceWorker({ step }: { step: number }) {
  const installServiceWorkerCode = "exec apihero-js init public/";

  return (
    <CommandLine step={step} code={installServiceWorkerCode}>
      <p className="text-sm text-slate-700">
        Install the Service Worker to forward specified browser traffic through
        a proxy server.
      </p>
    </CommandLine>
  );
}

type PackageManager = "npm" | "yarn" | "pnpm";

function CommandLine({
  step,
  children,
  code,
}: {
  step: number;
  children: ReactNode;
  code: string;
}) {
  const [packageManager, setPackageManager] = useState<PackageManager>("npm");

  return (
    <Instruction step={step}>
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-700">{children}</p>
        <Select
          className="w-max"
          value={packageManager}
          onChange={(val) =>
            setPackageManager(val.currentTarget.value as PackageManager)
          }
        >
          <option value="npm">npm</option>
          <option value="yarn">yarn</option>
          <option value="pnpm">pnpm</option>
        </Select>
      </div>

      <CodeBlock code={`${packageManager} ${code}`} />
    </Instruction>
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return <code className={inlineCode}>{children}</code>;
}

function CodeBlock({ code }: { code: string }) {
  const codeContainer =
    "flex items-center font-mono justify-between gap-2.5 rounded-md border bg-slate-700 py-2 pl-4 pr-2 text-sm text-white";
  return (
    <pre className={codeContainer}>
      {code}
      <CopyTextButton value={code} variant="blue" />
    </pre>
  );
}

function NextJs({ projectId }: { projectId: string }) {
  const nextJs = `async function initProxy() {
  const projectKey = "${projectId}";
  if (typeof window !== "undefined") {
    const { setupWorker } = await import("apihero-js");
    //update the allow list with the APIs you're using
    await setupWorker({ allow: ["https://api.github.com/*"], projectKey, env: process.env.NODE_ENV }).start();
  } else {
    const { setupProxy } = await import("apihero-js/node");
    await setupProxy({ projectKey, env: process.env.NODE_ENV }).start();
  }
}
initProxy();`;
  return (
    <Instructions>
      <InstallPackage />
      <InstallServiceWorker step={3} />
      <Instruction step={4}>
        <p className="text-sm text-slate-700">
          Add the following code to the bottom of your root page (e.g.
          pages/_app.tsx):
        </p>
        <CodeBlock code={nextJs} />
      </Instruction>
      <Instruction step={5}>
        <p className="text-sm text-slate-700">
          Ensure that you have{" "}
          <InlineCode>"moduleResolution": "nodenext"</InlineCode> in the{" "}
          <InlineCode>"compilerOptions"</InlineCode> section of your
          tsconfig.json file.
        </p>
      </Instruction>
      <Instruction step={6}>
        <p className="text-sm text-slate-700">
          Send any API request from your project, then come back here.
        </p>
        <div className="flex items-center gap-4">
          <CountdownToRefreshButton projectId={projectId} />
        </div>
      </Instruction>
    </Instructions>
  );
}

function NodeJs({ projectId }: { projectId: string }) {
  const nodeJs = `async function initProxy() {
const { setupProxy } = await import("apihero-js/node");
  await setupProxy({
    projectKey: "${projectId}",
    env: process.env.NODE_ENV,
    allow: ["https://api.github.com/*"], // remove this line if you want all traffic to be proxied
  }).start();
}
initProxy();`;
  return (
    <Instructions>
      <InstallPackage />
      <Instruction step={3}>
        <p className="text-sm text-slate-700">
          Place this code anywhere that is executed when your application
          starts:
        </p>
        <CodeBlock code={nodeJs} />
      </Instruction>
      <Instruction step={4}>
        <p className="text-sm text-slate-700">
          Send any API request from your project, then come back here.
        </p>
        <div className="flex items-center gap-4">
          <CountdownToRefreshButton projectId={projectId} />
        </div>
      </Instruction>
    </Instructions>
  );
}
