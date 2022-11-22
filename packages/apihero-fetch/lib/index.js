"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createFetchProxy: () => createFetchProxy
});
module.exports = __toCommonJS(src_exports);

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
//# sourceMappingURL=index.js.map