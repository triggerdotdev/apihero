import { DESTINATION_HEADER_NAME } from "@apihero/constants-js";

export async function proxyRequest(
  request: Request
): Promise<[Request, Response]> {
  const clonedRequest = request.clone();
  // Get the x-destination-origin header
  const origin = clonedRequest.headers.get(DESTINATION_HEADER_NAME);

  // If the header is not present, return the request
  if (!origin) {
    throw new Error(`${DESTINATION_HEADER_NAME} header is required`);
  }

  const sourceUrl = new URL(clonedRequest.url);
  const url = new URL(clonedRequest.url.replace(sourceUrl.origin, origin));

  const originRequest = new Request(url.href, {
    headers: stripHeaders(clonedRequest.headers),
    method: clonedRequest.method,
    body: clonedRequest.body,
  });

  // Otherwise, fetch a new request with the url as the url, removing the x-destination-origin header
  const response = await fetch(originRequest);

  return [request, response];
}

function stripHeaders(headers: Headers): Headers {
  const result = new Headers();
  for (const [key, value] of headers) {
    if (key !== DESTINATION_HEADER_NAME) {
      result.set(key, value);
    }
  }
  return result;
}
