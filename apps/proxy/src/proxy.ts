import {
  DESTINATION_HEADER_NAME,
  PAYLOAD_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
  PROTOCOL_HEADER_NAME,
} from "./constants";

export async function proxyRequest(
  request: Request,
  requestBody: any
): Promise<[Request, Response]> {
  // Get the x-destination-origin header
  const origin = request.headers.get(DESTINATION_HEADER_NAME);
  const protocol = request.headers.get(PROTOCOL_HEADER_NAME);

  // If the header is not present, return the request
  if (!origin) {
    throw new Error(`${DESTINATION_HEADER_NAME} header is required`);
  }

  if (!protocol) {
    throw new Error(`${PROTOCOL_HEADER_NAME} header is required`);
  }

  const url = new URL(request.url);
  url.protocol = protocol;
  url.host = origin;

  if (url.port && !origin.includes(":")) {
    url.port = "";
  }

  const originRequest = new Request(url.href, {
    headers: stripHeaders(request.headers),
    method: request.method,
    body:
      request.method !== "GET" && request.method !== "HEAD"
        ? requestBody
        : undefined,
    cf: {
      cacheEverything: true,
    },
  });

  // Otherwise, fetch a new request with the url as the url, removing the x-destination-origin header
  const response = await fetch(originRequest);

  return [originRequest, response];
}

function stripHeaders(headers: Headers): Headers {
  const result = new Headers();
  for (const [key, value] of headers) {
    if (key === DESTINATION_HEADER_NAME) continue;
    if (key === PROTOCOL_HEADER_NAME) continue;
    if (key === PROJECT_KEY_HEADER_NAME) continue;
    if (key === PAYLOAD_HEADER_NAME) continue;
    if (key === "host") continue;
    if (key === "cf-connecting-ip") continue;
    if (key === "cf-ipcountry") continue;
    if (key === "cf-ray") continue;
    if (key === "cf-visitor") continue;

    result.set(key, value);
  }
  return result;
}
