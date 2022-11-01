import {
  Headers,
  objectToHeaders,
  headersToObject,
  HeadersObject,
} from "headers-polyfill";
import { invariant } from "outvariant";
import { Interceptor } from "@mswjs/interceptors/lib/Interceptor";
import { IsomorphicRequest } from "@mswjs/interceptors/lib/IsomorphicRequest";
import {
  HttpRequestEventMap,
  IsomorphicResponse,
  IS_PATCHED_MODULE,
  ModifiedRequest,
} from "../../types";
import { InteractiveIsomorphicRequest } from "../../InteractiveIsomorphicRequest";

export class FetchInterceptor extends Interceptor<HttpRequestEventMap> {
  static symbol = Symbol("fetch");

  constructor() {
    super(FetchInterceptor.symbol);
  }

  protected checkEnvironment() {
    return (
      typeof globalThis !== "undefined" &&
      typeof globalThis.fetch !== "undefined"
    );
  }

  protected setup() {
    const pureFetch = globalThis.fetch;

    invariant(
      !(pureFetch as any)[IS_PATCHED_MODULE],
      'Failed to patch the "fetch" module: already patched.'
    );

    globalThis.fetch = async (input, init) => {
      const request = new Request(input, init);

      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.href
          : request.url;

      const method = request.method;

      this.log("[%s] %s", method, url);

      const body = await request.clone().arrayBuffer();
      const isomorphicRequest = new IsomorphicRequest(
        new URL(url, location.origin),
        {
          body,
          method,
          headers: new Headers(request.headers),
          credentials: request.credentials,
        }
      );

      const interactiveIsomorphicRequest = new InteractiveIsomorphicRequest(
        isomorphicRequest
      );

      this.log("isomorphic request", interactiveIsomorphicRequest);

      this.log(
        'emitting the "request" event for %d listener(s)...',
        this.emitter.listenerCount("request")
      );
      this.emitter.emit("request", interactiveIsomorphicRequest);

      this.log("awaiting for the mocked response...");

      await this.emitter.untilIdle("request", ({ args: [request] }) => {
        return request.id === interactiveIsomorphicRequest.id;
      });
      this.log("all request listeners have been resolved!");

      const [modifiedRequest] =
        await interactiveIsomorphicRequest.requestWith.invoked();
      this.log("event.requestWith called with:", modifiedRequest);

      if (modifiedRequest) {
        this.log("received modified request:", modifiedRequest);

        const newRequest = await integrateModifiedRequest(
          modifiedRequest,
          request
        );

        return this.performFetch(
          newRequest,
          pureFetch,
          interactiveIsomorphicRequest
        );
      }

      this.log("no mocked response received!");

      return this.performFetch(
        request,
        pureFetch,
        interactiveIsomorphicRequest
      );
    };

    Object.defineProperty(globalThis.fetch, IS_PATCHED_MODULE, {
      enumerable: true,
      configurable: true,
      value: true,
    });

    this.subscriptions.push(() => {
      Object.defineProperty(globalThis.fetch, IS_PATCHED_MODULE, {
        value: undefined,
      });

      globalThis.fetch = pureFetch;

      this.log('restored native "globalThis.fetch"!', globalThis.fetch.name);
    });
  }

  private async performFetch(
    request: Request,
    fetchFunction: typeof globalThis.fetch,
    interactiveIsomorphicRequest: InteractiveIsomorphicRequest
  ): Promise<Response> {
    return fetchFunction(request).then(async (response) => {
      const cloneResponse = response.clone();
      this.log("original fetch performed", cloneResponse);

      this.emitter.emit(
        "response",
        interactiveIsomorphicRequest,
        await normalizeFetchResponse(cloneResponse)
      );
      return response;
    });
  }
}

async function integrateModifiedRequest(
  modifiedRequest: ModifiedRequest,
  request: Request
): Promise<Request> {
  const newRequest: RequestInit = {
    method: modifiedRequest.method ?? request.method,
    headers: integrateModifiedHeaders(request.headers, modifiedRequest.headers),
    body: modifiedRequest.body ?? request.body,
    credentials: modifiedRequest.credentials ?? request.credentials,
  };

  return new Request(modifiedRequest.url ?? request.url, newRequest);
}

function integrateModifiedHeaders(
  headers: globalThis.Headers,
  modifiedHeaders?: HeadersObject
): globalThis.Headers {
  if (!modifiedHeaders) {
    return headers;
  }

  const normalizedHeaders = objectToHeaders(modifiedHeaders);

  const newHeaders = new Headers(headers);

  normalizedHeaders.forEach((value, name) => {
    newHeaders.set(name, value);
  });

  return newHeaders;
}

async function normalizeFetchResponse(
  response: Response
): Promise<IsomorphicResponse> {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: objectToHeaders(headersToObject(response.headers)),
    body: await response.text(),
  };
}
