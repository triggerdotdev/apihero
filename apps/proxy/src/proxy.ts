import {
  DESTINATION_HEADER_NAME,
  PAYLOAD_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
  PROTOCOL_HEADER_NAME,
} from "@apihero/constants-js";

export async function proxyRequest(
  request: Request
): Promise<[Request, Response]> {
  const clonedRequest = request.clone();
  // Get the x-destination-origin header
  const origin = clonedRequest.headers.get(DESTINATION_HEADER_NAME);
  const protocol = clonedRequest.headers.get(PROTOCOL_HEADER_NAME);

  // If the header is not present, return the request
  if (!origin) {
    throw new Error(`${DESTINATION_HEADER_NAME} header is required`);
  }

  if (!protocol) {
    throw new Error(`${PROTOCOL_HEADER_NAME} header is required`);
  }

  const url = new URL(clonedRequest.url);
  url.protocol = protocol;
  url.hostname = origin;

  if (url.port) {
    url.port = "";
  }

  const originRequest = new Request(url.href, {
    headers: stripHeaders(clonedRequest.headers),
    method: clonedRequest.method,
    body: clonedRequest.body,
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
