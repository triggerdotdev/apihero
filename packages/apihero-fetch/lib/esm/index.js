// ../internal-constants/src/index.ts
var DESTINATION_HEADER_NAME = "x-ah-origin";
var PROJECT_KEY_HEADER_NAME = "x-ah-pk";
var PROTOCOL_HEADER_NAME = "x-ah-proto";
var PAYLOAD_HEADER_NAME = "x-ah-payload";

// src/index.ts
var DEFAULT_OPTIONS = {
  url: "https://proxy.apihero.run",
  env: "development"
};
function createFetchProxy(options) {
  const { projectKey, url: proxyUrl, env } = { ...DEFAULT_OPTIONS, ...options };
  return async function fetchProxy(input, init) {
    var _a;
    const extractedUrl = typeof input === "string" ? input : input instanceof Request ? input.url : input.href;
    const url = new URL(extractedUrl);
    const newUrl = new URL(url.pathname + url.search, proxyUrl);
    const headers = getOriginalHeaders(input, init);
    headers.set(DESTINATION_HEADER_NAME, url.host);
    headers.set(PROTOCOL_HEADER_NAME, url.protocol);
    headers.set(PROJECT_KEY_HEADER_NAME, projectKey);
    headers.set(PAYLOAD_HEADER_NAME, JSON.stringify({ env }));
    const newRequest = new Request(newUrl, {
      ...init,
      headers,
      body: ["GET", "HEAD", "DELETE", "OPTIONS"].includes(
        ((_a = init == null ? void 0 : init.method) == null ? void 0 : _a.toUpperCase()) ?? ""
      ) ? void 0 : getOriginalBody(input, init)
    });
    return fetch(newRequest);
  };
}
function getOriginalHeaders(input, init) {
  if (input instanceof Request) {
    return input.headers;
  }
  if (init == null ? void 0 : init.headers) {
    return new Headers(init.headers);
  }
  return new Headers();
}
function getOriginalBody(input, init) {
  if (input instanceof Request) {
    return input.body;
  }
  return init == null ? void 0 : init.body;
}
export {
  createFetchProxy
};
//# sourceMappingURL=index.js.map