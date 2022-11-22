import { SetupWorkerInternalContext, StopHandler } from "../../types";
import { formatMessage } from "../utils/formatting";

export const createStop = (
  context: SetupWorkerInternalContext
): StopHandler => {
  return function stop() {
    // Warn developers calling "worker.stop()" more times than necessary.
    // This likely indicates a mistake in their code.
    if (!context.isProxyingEnabled) {
      console.warn(
        'Found a redundant "worker.stop()" call. Note that stopping the worker while proxying already stopped has no effect. Consider removing this "worker.stop()" call.'
      );
      return;
    }

    /**
     * Signal the Service Worker to disable mocking for this client.
     * Use this an an explicit way to stop the mocking, while preserving
     * the worker-client relation. Does not affect the worker's lifecycle.
     */
    context.workerChannel.send("PROXY_DEACTIVATE");
    context.isProxyingEnabled = false;
    window.clearInterval(context.keepAliveInterval);

    printStopMessage({ quiet: false });
  };
};

function printStopMessage(args: { quiet?: boolean } = {}): void {
  if (args.quiet) {
    return;
  }

  console.log(
    `%c${formatMessage("Proxying disabled.")}`,
    "color:orangered;font-weight:bold;"
  );
}
