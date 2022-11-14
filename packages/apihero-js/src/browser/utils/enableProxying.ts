import { SetupWorkerInternalContext, StartWorkerOptions } from "../../types";
import { formatMessage } from "./formatting";

export async function enableProxying(
  context: SetupWorkerInternalContext,
  options: StartWorkerOptions
) {
  context.workerChannel.send("PROXY_ACTIVATE");
  await context.events.once("PROXYING_ENABLED");

  // Warn the developer on multiple "worker.start()" calls.
  // While this will not affect the worker in any way,
  // it likely indicates an issue with the developer's code.
  if (context.isProxyingEnabled) {
    console.warn(
      `Found a redundant "worker.start()" call. Note that starting the worker while proxying is already enabled will have no effect. Consider removing this "worker.start()" call.`
    );
    return;
  }

  context.isProxyingEnabled = true;

  printStartMessage({
    quiet: false,
    workerScope: context.registration?.scope,
    workerUrl: context.worker?.scriptURL,
  });
}

type PrintStartMessageArgs = {
  quiet?: boolean;
  message?: string;
  workerUrl?: string;
  workerScope?: string;
};

export function printStartMessage(args: PrintStartMessageArgs = {}) {
  if (args.quiet) {
    return;
  }

  const message = args.message || "Mocking enabled.";

  console.groupCollapsed(
    `%c${formatMessage(message)}`,
    "color:orangered;font-weight:bold;"
  );
  console.log(
    "%cDocumentation: %chttps://docs.apihero.run",
    "font-weight:bold",
    "font-weight:normal"
  );
  console.log("Found an issue? https://github.com/apihero-run/apihero/issues");

  if (args.workerUrl) {
    console.log("Worker script URL:", args.workerUrl);
  }

  if (args.workerScope) {
    console.log("Worker scope:", args.workerScope);
  }

  console.groupEnd();
}
