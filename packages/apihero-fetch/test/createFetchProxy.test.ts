import { createFetchProxy, FetchFunction } from "../src";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  vi,
  test,
  afterAll,
} from "vitest";

import {
  DESTINATION_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
  PROTOCOL_HEADER_NAME,
  PAYLOAD_HEADER_NAME,
} from "internal-constants";

import { HttpServer } from "./support/httpServer";

const proxyServer = new HttpServer((app) => {
  app.get("/get", (req, res) => {
    res.header("x-powered-by", "apihero");
    res
      .status(200)
      .json({
        proxy: true,
        requestHeaders: req.headers,
        searchParams: req.query,
      })
      .end();
  });

  app.post("/post", (req, res) => {
    res.header("x-powered-by", "apihero");

    res
      .status(200)
      .json({
        proxy: true,
        body: req.body,
        requestHeaders: req.headers,
      })
      .end();
  });
});

let fetchProxy: FetchFunction;

describe("createFetchProxy / fetch", () => {
  beforeAll(async () => {
    await proxyServer.listen();

    fetchProxy = createFetchProxy({
      projectKey: "hero_abc123",
      url: proxyServer.http.address.href,
      env: "test",
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(async () => {
    await proxyServer.close();
  });

  describe("given I perform a GET request using fetchProxy", () => {
    let res: Response;

    beforeAll(async () => {
      res = await fetchProxy("https://httpbin.org/get");
    });

    test("should return proxy status code", async () => {
      expect(res.status).toEqual(200);
    });

    test("should return proxy headers", () => {
      expect(res.headers.get("x-powered-by")).toEqual("apihero");
    });

    test("should return proxied body", async () => {
      const body = await res.json();

      expect(body).toEqual(
        expect.objectContaining({
          proxy: true,
          requestHeaders: expect.objectContaining({
            [PROJECT_KEY_HEADER_NAME]: "hero_abc123",
            [PROTOCOL_HEADER_NAME]: "https:",
            [DESTINATION_HEADER_NAME]: "httpbin.org",
            [PAYLOAD_HEADER_NAME]: JSON.stringify({ env: "test" }),
          }),
        })
      );
    });
  });

  describe("given I perform a GET request using fetchProxy with search params", () => {
    let res: Response;

    beforeAll(async () => {
      res = await fetchProxy("https://httpbin.org/get?foo=bar");
    });

    test("should return proxy status code", async () => {
      expect(res.status).toEqual(200);
    });

    test("should return proxy headers", () => {
      expect(res.headers.get("x-powered-by")).toEqual("apihero");
    });

    test("should return proxied body", async () => {
      const body = await res.json();

      expect(body).toEqual(
        expect.objectContaining({
          proxy: true,
          requestHeaders: expect.objectContaining({
            [PROJECT_KEY_HEADER_NAME]: "hero_abc123",
            [PROTOCOL_HEADER_NAME]: "https:",
            [DESTINATION_HEADER_NAME]: "httpbin.org",
            [PAYLOAD_HEADER_NAME]: JSON.stringify({ env: "test" }),
          }),
          searchParams: {
            foo: "bar",
          },
        })
      );
    });
  });

  describe("given I perform a POST request using fetch", () => {
    let res: Response;

    beforeAll(async () => {
      res = await fetchProxy("https://httpbin.org/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: "info",
        }),
      });
    });

    test("should return proxy status code", () => {
      expect(res.status).toEqual(200);
    });

    test("should return proxy headers", () => {
      expect(res.headers.get("x-powered-by")).toEqual("apihero");
    });

    test("should return proxied and parsed JSON body", async () => {
      const body = await res.json();
      expect(body).toEqual(
        expect.objectContaining({
          body: {
            payload: "info",
          },
          proxy: true,
          requestHeaders: expect.objectContaining({
            [PROJECT_KEY_HEADER_NAME]: "hero_abc123",
            [PROTOCOL_HEADER_NAME]: "https:",
            [DESTINATION_HEADER_NAME]: "httpbin.org",
            [PAYLOAD_HEADER_NAME]: JSON.stringify({ env: "test" }),
          }),
        })
      );
    });
  });
});
