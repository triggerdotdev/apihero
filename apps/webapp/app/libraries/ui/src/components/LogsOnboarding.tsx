import { Tab } from "@headlessui/react";
import {
  ArrowTopRightOnSquareIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { useCallback, useEffect, useState } from "react";
import { StyledTabs } from "~/libraries/common";
import { CodeEditor } from "~/libraries/common/src/components/editor/JavascriptEditor";
import type { LoaderData } from "~/routes/__app/workspaces/$workspaceSlug/projects/$projectSlug/home";
import { Spinner } from "../../../common/src/components/Spinner";
import { SecondaryA } from "./Buttons/Buttons";
import { CopyTextButton } from "./Buttons/CopyTextButton";
import { Select } from "./Select";

export function LogsOnboarding({
  project,
  workspaceSlug,
  hasLogs,
}: LoaderData & { workspaceSlug: string }) {
  return <>{!hasLogs && <OnboardingIncomplete projectId={project.id} />}</>;
}

const inlineCode =
  "px-1 py-0.5 bg-slate-200 border border-slate-300 rounded text-slate-700";

type PackageManagerContextType = [PackageManager, (pm: PackageManager) => void];

const PackageManagerContext = createContext<
  PackageManagerContextType | undefined
>(undefined);

function PackageManagerProvider({
  defaultProvider,
  children,
}: {
  defaultProvider: PackageManager;
  children: ReactNode;
}) {
  const [packageManager, setPackageManager] = useState(defaultProvider);

  return (
    <PackageManagerContext.Provider value={[packageManager, setPackageManager]}>
      {children}
    </PackageManagerContext.Provider>
  );
}

function usePackageManager(): PackageManagerContextType {
  const context = useContext(PackageManagerContext);
  if (context === undefined) {
    throw new Error(
      "usePackageManager must be used within a PackageManagerProvider"
    );
  }
  return context;
}

function OnboardingIncomplete({ projectId }: { projectId: string }) {
  return (
    <PackageManagerProvider defaultProvider="npm">
      <div className="grid grid-cols-[4fr_1fr] gap-2 mb-4 mr-4">
        <div className="bg-slate-100 p-4 border border-slate-200 rounded-md overflow-hidden">
          <h2 className="font-semibold text-xl mb-4 text-slate-600">
            Get started
          </h2>

          <ul className="flex gap-2 mb-2">
            <Instruction step={1}>
              <p className="text-sm text-slate-700">
                Select your framework. Or view other available frameworks{" "}
                <a
                  href="https://docs.apihero.run"
                  rel="noreferrer"
                  target="_blank"
                  className="underline hover:text-slate-800 transition"
                >
                  here
                </a>
                .
              </p>
            </Instruction>
          </ul>

          <Tab.Group>
            <StyledTabs.SegmentedList>
              <StyledTabs.Segmented>Node</StyledTabs.Segmented>
              <StyledTabs.Segmented>Next.js</StyledTabs.Segmented>
              <StyledTabs.Segmented>React</StyledTabs.Segmented>
            </StyledTabs.SegmentedList>
            <Tab.Panels className="flex-grow pt-4">
              <Tab.Panel className="relative h-full">
                <NodeJs projectId={projectId} />
              </Tab.Panel>
              <Tab.Panel className="relative h-full">
                <NextJs projectId={projectId} />
              </Tab.Panel>
              <Tab.Panel className="relative h-full">
                <React projectId={projectId} />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
        <HavingTroublePanel />
      </div>
    </PackageManagerProvider>
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
    <li className="flex gap-2 items-baseline">
      <span className={classNames(classes)}>{step}</span>
      <div className="flex flex-col gap-2 w-full">{children}</div>
    </li>
  );
}

function InstallPackage({ packageName }: { packageName: string }) {
  return (
    <CommandLine
      step={2}
      code={{
        npm: `npm install ${packageName}@latest`,
        yarn: `yarn add ${packageName}@latest`,
        pnpm: `pnpm add ${packageName}@latest`,
      }}
    >
      Install the <InlineCode>{packageName}</InlineCode> package.
    </CommandLine>
  );
}

function InstallServiceWorker({ step }: { step: number }) {
  return (
    <CommandLine
      step={step}
      code={{
        npm: "npm exec apihero-cli init public/",
        yarn: "yarn exec apihero-cli init public/",
        pnpm: "pnpm exec apihero-cli init public/",
      }}
    >
      Install the Service Worker to forward specified browser traffic through a
      proxy server. Select <InlineCode>Y</InlineCode> to save{" "}
      <InlineCode>"public"</InlineCode> as the worker directory.
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
  code: {
    yarn: string;
    npm: string;
    pnpm: string;
  };
}) {
  const [packageManager, setPackageManager] = usePackageManager();

  const codeToDisplay = code[packageManager];

  return (
    <Instruction step={step}>
      <div className="flex justify-between items-baseline">
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

      <CodeBlock code={codeToDisplay} language="shell" />
    </Instruction>
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return <code className={inlineCode}>{children}</code>;
}

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: "shell" | "typescript";
}) {
  return (
    <div className="relative rounded-md border py-2 pl-4 pr-2 text-sm bg-slate-700">
      <CodeEditor
        content={code}
        language={language}
        showLineNumbers={false}
        showHighlights={false}
      />
      <div className="absolute top-2 right-2">
        <CopyTextButton value={code} variant="blue" />
      </div>
    </div>
  );
}

function NextJs({ projectId }: { projectId: string }) {
  const code = `async function initProxy() {
  const projectKey = "${projectId}";
  if (typeof window !== "undefined") {
    const { setupWorker } = await import("@apihero/browser");
    //update the allow list with the APIs you're using
    await setupWorker({ 
      allow: ["https://api.github.com/*"], 
      projectKey, 
      env: process.env.NODE_ENV 
    }).start();
  }
}
initProxy();`;
  return (
    <Instructions>
      <InstallPackage packageName="@apihero/browser" />
      <InstallServiceWorker step={3} />
      <Instruction step={4}>
        <p className="text-sm text-slate-700">
          Add the following code to the bottom of your root page (e.g.
          pages/_app.tsx):
        </p>
        <CodeBlock code={code} language="typescript" />
      </Instruction>
      <Instruction step={5}>
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
  const code = `import { setupProxy } from "@apihero/node";
  
function initProxy() {
  const proxy = setupProxy({
    projectKey: "${projectId}",
    env: process.env.NODE_ENV,
    // remove this line if you want all traffic to be proxied
    allow: ["https://api.github.com/*"] 
  });

  proxy.start();
}
initProxy();`;
  return (
    <Instructions>
      <InstallPackage packageName="@apihero/node" />
      <Instruction step={3}>
        <p className="text-sm text-slate-700">
          Place this code anywhere that is executed when your application
          starts:
        </p>
        <CodeBlock code={code} language="typescript" />
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

function React({ projectId }: { projectId: string }) {
  const code = `async function initProxy() {
  if (typeof window !== "undefined") {
    const { setupWorker } = await import("@apihero/browser");
    //update the allow list with the APIs you're using
    await setupWorker({ 
      allow: ["https://api.github.com/*"], 
      projectKey: "${projectId}", 
      env: process.env.NODE_ENV 
    }).start();
  }
}
initProxy();`;
  return (
    <Instructions>
      <InstallPackage packageName="@apihero/browser" />
      <InstallServiceWorker step={3} />
      <Instruction step={4}>
        <p className="text-sm text-slate-700">
          Add the following code at the bottom of your root component file (e.g.
          App.tsx):
        </p>
        <CodeBlock code={code} language="typescript" />
      </Instruction>
      <Instruction step={5}>
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
