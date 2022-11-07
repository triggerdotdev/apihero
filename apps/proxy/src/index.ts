import { DESTINATION_HEADER_NAME } from "@apihero/constants-js";

export default {
  async fetch(request: Request) {
    // Get the x-destination-origin header
    const origin = request.headers.get(DESTINATION_HEADER_NAME);

    // If the header is not present, return the request
    if (!origin) {
      throw new Error(`${DESTINATION_HEADER_NAME} header is required`);
    }

    const sourceUrl = new URL(request.url);
    const url = new URL(request.url.replace(sourceUrl.origin, origin));

    // Otherwise, fetch a new request with the url as the url, removing the x-destination-origin header
    const response = await fetch(
      new Request(url.href, {
        headers: stripHeaders(request.headers),
        method: request.method,
        body: request.body,
      })
    );

    return response;
  },
};

function stripHeaders(headers: Headers): Headers {
  const result = new Headers();
  for (const [key, value] of headers) {
    if (key !== DESTINATION_HEADER_NAME) {
      result.set(key, value);
    }
  }
  return result;
}
