export default {
  async fetch(request: Request) {
    // Get the x-origin-url header
    const url = request.headers.get("x-origin-url");

    // If the header is not present, return the request
    if (!url) {
      throw new Error("x-origin-url header is required");
    }

    // Otherwise, fetch a new request with the url as the url, removing the x-origin-url header
    const response = await fetch(
      new Request(url, {
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
    if (key !== "x-origin-url") {
      result.set(key, value);
    }
  }
  return result;
}
