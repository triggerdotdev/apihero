import {
  ServiceWorkerIncomingEventsMap,
  SetupWorkerInstance,
  SetupWorkerInternalContext,
  SetupWorkerOptions,
} from "../types";
import { isNodeProcess } from "is-node-process";
import { ServiceWorkerMessage } from "./utils/messageChannel";
import { createStartHandler, prepareStartHandler } from "./worker/start";
import { createStop } from "./worker/stop";

interface Listener {
  target: EventTarget;
  eventType: string;
  callback: EventListener;
}

// Declare the list of event handlers on the module's scope
// so it persists between Fash refreshes of the application's code.
let listeners: Listener[] = [];

export function setupWorker(options: SetupWorkerOptions): SetupWorkerInstance {
  // Error when attempting to run this function in a Node.js environment.
  if (isNodeProcess()) {
    throw new Error(
      "Failed to execute `setupWorker` in a non-browser environment. Consider using `createProxy` for Node.js environment instead."
    );
  }

  if (!options.allow || (options.allow && !options.allow.length)) {
    console.warn(
      "Failed to execute `setupWorker`: the `allow` option is required."
    );

    return {
      start: () => Promise.resolve(undefined),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      stop: () => {},
    };
  }

  const context: SetupWorkerInternalContext = {
    isProxyingEnabled: false,
    startOptions: undefined,
    worker: null,
    registration: null,
    proxyOptions: options,
    workerChannel: {
      send(type) {
        context.worker?.postMessage(type);
      },
      on(eventType, callback) {
        context.events.addListener(
          navigator.serviceWorker,
          "message",
          (event: MessageEvent) => {
            if (event.source !== context.worker) {
              return;
            }

            const message = event.data as ServiceWorkerMessage<
              typeof eventType,
              any
            >;

            if (!message) {
              return;
            }

            if (message.type === eventType) {
              callback(event, message);
            }
          }
        );
      },
    },
    events: {
      addListener(
        target: EventTarget,
        eventType: string,
        callback: EventListener
      ) {
        target.addEventListener(eventType, callback);
        listeners.push({ eventType, target, callback });

        return () => {
          target.removeEventListener(eventType, callback);
        };
      },
      removeAllListeners() {
        for (const { target, eventType, callback } of listeners) {
          target.removeEventListener(eventType, callback);
        }
        listeners = [];
      },
      once(eventType) {
        const bindings: Array<() => void> = [];

        return new Promise<
          ServiceWorkerMessage<
            typeof eventType,
            ServiceWorkerIncomingEventsMap[typeof eventType]
          >
        >((resolve, reject) => {
          const handleIncomingMessage = (event: MessageEvent) => {
            try {
              const message = event.data;

              if (message.type === eventType) {
                resolve(message);
              }
            } catch (error) {
              reject(error);
            }
          };

          bindings.push(
            context.events.addListener(
              navigator.serviceWorker,
              "message",
              handleIncomingMessage
            ),
            context.events.addListener(
              navigator.serviceWorker,
              "messageerror",
              reject
            )
          );
        }).finally(() => {
          bindings.forEach((unbind) => unbind());
        });
      },
    },
  };

  const startHandler = createStartHandler(context);
  const start = prepareStartHandler(startHandler, context);
  const stopHandler = createStop(context);

  return {
    start,
    stop() {
      context.events.removeAllListeners();
      stopHandler();
    },
  };
}
