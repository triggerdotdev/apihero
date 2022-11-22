import {
  DESTINATION_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
  PROTOCOL_HEADER_NAME,
  PAYLOAD_HEADER_NAME,
} from "internal-constants";

export type FetchFunction = typeof fetch;

export type FetchProxyOptions = {
  projectKey: string;
  url?: string;
  env?: string;
};

type InputType = Parameters<FetchFunction>[0];
type InitType = Parameters<FetchFunction>[1];

const DEFAULT_OPTIONS = {
  url: "https://proxy.apihero.run",
  env: "development",
};

export function createFetchProxy(options: FetchProxyOptions): FetchFunction {
  const { projectKey, url: proxyUrl, env } = { ...DEFAULT_OPTIONS, ...options };

  return async function fetchProxy(
    input: InputType,
    init?: InitType
  ): Promise<Response> {
    const extractedUrl =
      typeof input === "string"
        ? input
        : input instanceof Request
        ? input.url
        : input.href;

    const url = new URL(extractedUrl);

    // Create a new URL object with the proxy URL as the base URL (and don't forget the search params)
    const newUrl = new URL(url.pathname + url.search, proxyUrl);

    // Get the headers from the original request, either in input === Request or from the init object
    const headers = getOriginalHeaders(input, init);

    // Add the headers that the proxy needs
    headers.set(DESTINATION_HEADER_NAME, url.host);
    headers.set(PROTOCOL_HEADER_NAME, url.protocol);
    headers.set(PROJECT_KEY_HEADER_NAME, projectKey);
    headers.set(PAYLOAD_HEADER_NAME, JSON.stringify({ env }));

    // Create a new Request object with the new URL and the headers (and body if it's not a GET/HEAD/DELETE/OPTIONS request)
    const newRequest = new Request(newUrl, {
      ...init,
      headers,
      body: ["GET", "HEAD", "DELETE", "OPTIONS"].includes(
        init?.method?.toUpperCase() ?? ""
      )
        ? undefined
        : getOriginalBody(input, init),
    });

    // Call the original fetch function with the new Request object
    return fetch(newRequest);
  };
}

function getOriginalHeaders(input: InputType, init?: InitType): Headers {
  if (input instanceof Request) {
    return input.headers;
  }

  if (init?.headers) {
    return new Headers(init.headers);
  }

  return new Headers();
}

function getOriginalBody(
  input: InputType,
  init?: InitType
): BodyInit | null | undefined {
  if (input instanceof Request) {
    return input.body;
  }

  return init?.body;
}
