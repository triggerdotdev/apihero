import { ServiceWorkerMessage } from "./browser/utils/messageChannel";

export type PolicyMatcher = {
  method: string;
  url: string;
};

export type PolicyRule = string | PolicyMatcher;

export type SetupProxyOptions = {
  projectKey: string;
  url: string;
  allow?: Array<PolicyRule>;
  deny?: Array<PolicyRule>;
  env?: string;
};

export type SetupWorkerOptions = Omit<SetupProxyOptions, "allow"> & {
  allow: Array<PolicyRule>;
};

export type StartWorkerOptions = {
  serviceWorker?: {
    /**
     * Custom url to the worker script.
     * @default "/proxyServiceWorker.js"
     */
    url?: string;
    options?: RegistrationOptions;
  };
};

export type StartWorkerReturnType = Promise<
  ServiceWorkerRegistration | undefined
>;

export type SetupWorkerInstance = {
  start: (options?: StartWorkerOptions) => StartWorkerReturnType;
  stop: StopHandler;
};

export type StartHandler = (
  options: RequiredDeep<StartWorkerOptions>,
  initialOptions: StartWorkerOptions
) => StartWorkerReturnType;
export type StopHandler = () => void;

/**
 * Request representation received from the worker message event.
 */
export type ServiceWorkerIncomingRequest = {
  /**
   * Unique UUID of the request generated once the request is
   * captured by the "fetch" event in the Service Worker.
   */
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
};

export interface ServiceWorkerIncomingEventsMap {
  PROXYING_ENABLED: boolean;
  INTEGRITY_CHECK_RESPONSE: string;
  KEEPALIVE_RESPONSE: never;
  REQUEST: ServiceWorkerIncomingRequest;
}

export type ServiceWorkerOutgoingEventTypes =
  | "PROXY_ACTIVATE"
  | "PROXY_DEACTIVATE"
  | "INTEGRITY_CHECK_REQUEST"
  | "KEEPALIVE_REQUEST"
  | "CLIENT_CLOSED";

export interface SetupWorkerInternalContext {
  isProxyingEnabled: boolean;
  startOptions?: RequiredDeep<StartWorkerOptions>;
  worker: ServiceWorker | null;
  registration: ServiceWorkerRegistration | null;
  proxyOptions: SetupProxyOptions;
  keepAliveInterval?: number;
  workerChannel: {
    /**
     * Adds a Service Worker event listener.
     */
    on<EventType extends keyof ServiceWorkerIncomingEventsMap>(
      eventType: EventType,
      callback: (
        event: MessageEvent,
        message: ServiceWorkerMessage<
          EventType,
          ServiceWorkerIncomingEventsMap[EventType]
        >
      ) => void
    ): void;
    send<EventType extends ServiceWorkerOutgoingEventTypes>(
      eventType: EventType
    ): void;
  };
  events: {
    addListener<EventType extends Event = Event>(
      target: EventTarget,
      eventType: string,
      callback: (event: EventType) => void
    ): () => void;

    removeAllListeners(): void;
    /**
     * Awaits a given message type from the Service Worker.
     */
    once<EventType extends keyof ServiceWorkerIncomingEventsMap>(
      eventType: EventType
    ): Promise<
      ServiceWorkerMessage<EventType, ServiceWorkerIncomingEventsMap[EventType]>
    >;
  };
}

export type ModifiedFetchRequest = {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
};

export type ServiceWorkerInstanceTuple = [
  ServiceWorker | null,
  ServiceWorkerRegistration
];

type Fn = (...arg: unknown[]) => unknown;
export type RequiredDeep<
  Type,
  U extends Record<string, unknown> | Fn | undefined = undefined
> = Type extends Fn
  ? Type
  : /**
   * @note The "Fn" type satisfies the predicate below.
   * It must always come first, before the Record check.
   */
  Type extends Record<string, unknown>
  ? {
      [Key in keyof Type]-?: NonNullable<Type[Key]> extends NonNullable<U>
        ? NonNullable<Type[Key]>
        : RequiredDeep<NonNullable<Type[Key]>, U>;
    }
  : Type;
