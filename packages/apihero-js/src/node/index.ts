import {
  DESTINATION_HEADER_NAME,
  PAYLOAD_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
  PROTOCOL_HEADER_NAME,
} from "../constants";
import { IsomorphicRequest } from "@apihero/interceptors-js";
import { ClientRequestInterceptor } from "@apihero/interceptors-js/lib/interceptors/ClientRequest/index.js";
import { FetchInterceptor } from "@apihero/interceptors-js/lib/interceptors/fetch/index.js";
import { isMatch } from "../matcher";
import debug from "debug";
import { SetupProxyOptions, PolicyRule } from "../types";

const log = debug("apihero");

export interface ProxyInstance {
  start(callback?: () => void): void;
  stop(): void;
}

export function setupProxy(options: SetupProxyOptions): ProxyInstance {
  const interceptor = new ClientRequestInterceptor();
  const fetchInterceptor = new FetchInterceptor();

  const proxyUrl = options.url || "https://proxy.apihero.run";

  fetchInterceptor.on("request", (request) => {
    if (
      (options.allow && !isAllowed(request, options.allow)) ||
      (options.deny && isAllowed(request, options.deny))
    ) {
      log("request not proxied", request.url.href);
      return;
    }

    const newUrl = new URL(request.url.pathname, proxyUrl);

    const env = options.env || process.env.NODE_ENV || "development";

    request.requestWith({
      url: newUrl,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        [DESTINATION_HEADER_NAME]: request.url.host,
        [PROTOCOL_HEADER_NAME]: request.url.protocol,
        [PROJECT_KEY_HEADER_NAME]: options.projectKey,
        [PAYLOAD_HEADER_NAME]: JSON.stringify({ env }),
      },
    });
  });

  interceptor.on("connect", (request) => {
    if (
      (options.allow && !isAllowed(request, options.allow)) ||
      (options.deny && isAllowed(request, options.deny))
    ) {
      log("request not proxied", request.url.href);
      return;
    }

    const newUrl = new URL(request.url.pathname, proxyUrl);

    const env = options.env || process.env.NODE_ENV || "development";

    log(`proxying ${request.url.href} to ${newUrl.href}`);

    request.connectWith({
      url: newUrl,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        [DESTINATION_HEADER_NAME]: request.url.host,
        [PROTOCOL_HEADER_NAME]: request.url.protocol,
        [PROJECT_KEY_HEADER_NAME]: options.projectKey,
        [PAYLOAD_HEADER_NAME]: JSON.stringify({ env }),
      },
    });
  });

  const internalInstance = new InternalProxyInstance([
    interceptor,
    fetchInterceptor,
  ]);

  return internalInstance;
}

function isAllowed(
  request: IsomorphicRequest,
  allow: Array<PolicyRule>
): boolean {
  return allow.some((rule) => {
    if (typeof rule === "string") {
      return isMatch(request.url.href, rule);
    }

    return (
      rule.method === request.method && isMatch(request.url.href, rule.url)
    );
  });
}

class InternalProxyInstance implements ProxyInstance {
  private _isStarted = false;

  constructor(
    private interceptors: Array<ClientRequestInterceptor | FetchInterceptor>
  ) {
    this.interceptors = interceptors;
  }

  start(callback?: () => void) {
    if (this._isStarted) {
      return;
    }

    this.interceptors.forEach((interceptor) => interceptor.apply());
    this._isStarted = true;
    callback?.();
  }

  stop() {
    this.interceptors.forEach((interceptor) => interceptor.dispose());
  }
}
