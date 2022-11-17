import {
  DESTINATION_HEADER_NAME,
  PAYLOAD_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
  PROTOCOL_HEADER_NAME,
} from "../../constants";
import { until } from "@open-draft/until";
import { isMatch } from "matcher";
import {
  PolicyRule,
  RequiredDeep,
  ServiceWorkerIncomingEventsMap,
  ServiceWorkerIncomingRequest,
  SetupWorkerInstance,
  SetupWorkerInternalContext,
  StartHandler,
  StartWorkerOptions,
} from "../../types";
import { enableProxying } from "../utils/enableProxying";
import { requestIntegrityCheck } from "../utils/integrityCheck";
import { mergeRight } from "../utils/internal";
import { ServiceWorkerMessage, WorkerChannel } from "../utils/messageChannel";
import { getWorkerInstance } from "../utils/workerInstance";

export function createStartHandler(
  context: SetupWorkerInternalContext
): StartHandler {
  return function start(options, customOptions) {
    async function startWorkerInstance() {
      // Remove all previously existing event listeners.
      // This way none of the listeners persists between Fast refresh
      // of the application's code.
      context.events.removeAllListeners();

      // Handle requests signaled by the worker.
      context.workerChannel.on(
        "REQUEST",
        createRequestListener(context, options)
      );

      const instance = await getWorkerInstance(
        options.serviceWorker.url,
        options.serviceWorker.options
      );

      const [worker, registration] = instance;

      if (!worker) {
        throw new Error("Failed to locate the Service Worker registration");
      }

      context.worker = worker;
      context.registration = registration;

      context.events.addListener(window, "beforeunload", () => {
        if (worker.state !== "redundant") {
          // Notify the Service Worker that this client has closed.
          // Internally, it's similar to disabling the mocking, only
          // client close event has a handler that self-terminates
          // the Service Worker when there are no open clients.
          context.workerChannel.send("CLIENT_CLOSED");
        }
        // Make sure we're always clearing the interval - there are reports that not doing this can
        // cause memory leaks in headless browser environments.
        window.clearInterval(context.keepAliveInterval);
      });

      // Check if the active Service Worker is the latest published one
      const { error: integrityError } = await until(() =>
        requestIntegrityCheck(context, worker)
      );

      if (integrityError) {
        console.error(
          `Detected outdated Service Worker: ${integrityError.message}`
        );
      }

      context.keepAliveInterval = window.setInterval(
        () => context.workerChannel.send("KEEPALIVE_REQUEST"),
        5000
      );

      return registration;
    }

    const workerRegistration = startWorkerInstance().then(
      async (registration) => {
        const pendingInstance = registration.installing || registration.waiting;

        // Wait until the worker is activated.
        // Assume the worker is already activated if there's no pending registration
        // (i.e. when reloading the page after a successful activation).
        if (pendingInstance) {
          await new Promise<void>((resolve) => {
            pendingInstance.addEventListener("statechange", () => {
              if (pendingInstance.state === "activated") {
                return resolve();
              }
            });
          });
        }

        // Print the activation message only after the worker has been activated.
        await enableProxying(context, options).catch((error) => {
          throw new Error(`Failed to enable mocking: ${error?.message}`);
        });

        return registration;
      }
    );

    return workerRegistration;
  };
}

export function prepareStartHandler(
  handler: StartHandler,
  context: SetupWorkerInternalContext
): SetupWorkerInstance["start"] {
  return (initialOptions) => {
    context.startOptions = resolveStartOptions(initialOptions);
    return handler(context.startOptions, initialOptions || {});
  };
}

export const DEFAULT_START_OPTIONS: RequiredDeep<StartWorkerOptions> = {
  serviceWorker: {
    url: "/proxyServiceWorker.js",
    options: null as any,
  },
};

function resolveStartOptions(
  initialOptions?: StartWorkerOptions
): RequiredDeep<StartWorkerOptions> {
  return mergeRight(
    DEFAULT_START_OPTIONS,
    initialOptions || {}
  ) as RequiredDeep<StartWorkerOptions>;
}

function createRequestListener(
  context: SetupWorkerInternalContext,
  options: RequiredDeep<StartWorkerOptions>
) {
  return async (
    event: MessageEvent,
    message: ServiceWorkerMessage<
      "REQUEST",
      ServiceWorkerIncomingEventsMap["REQUEST"]
    >
  ) => {
    const messageChannel = new WorkerChannel(event.ports[0]);
    const request = message.payload;

    try {
      if (
        (context.proxyOptions.allow &&
          !isAllowed(request, context.proxyOptions.allow)) ||
        (context.proxyOptions.deny &&
          isAllowed(request, context.proxyOptions.deny))
      ) {
        messageChannel.postMessage("PROXY_BYPASS");
        return;
      }

      const requestUrl = new URL(request.url);
      const newUrl = new URL(requestUrl.pathname, context.proxyOptions.url);

      messageChannel.postMessage("PROXY_REQUEST", {
        url: newUrl.href,
        headers: {
          ...request.headers,
          [DESTINATION_HEADER_NAME]: requestUrl.host,
          [PROTOCOL_HEADER_NAME]: requestUrl.protocol,
          [PROJECT_KEY_HEADER_NAME]: context.proxyOptions.projectKey,
          [PAYLOAD_HEADER_NAME]: JSON.stringify({
            env: context.proxyOptions.env,
          }),
        },
      });
    } catch (error) {
      // Handle the error by sending it to the worker.
      if (error instanceof Error) {
        messageChannel.postMessage("ERROR", {
          name: error.name,
          message: error.message,
        });
      }
    }
  };
}

function isAllowed(
  request: ServiceWorkerIncomingRequest,
  allow: Array<PolicyRule>
): boolean {
  return allow.some((rule) => {
    if (typeof rule === "string") {
      return isMatch(request.url, rule);
    }

    return rule.method === request.method && isMatch(request.url, rule.url);
  });
}
