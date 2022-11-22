import { HttpServer } from "../support/httpServer";
import { setupProxy } from "../../src";
import {
  afterAll,
  afterEach,
  beforeAll,
  expect,
  vi,
  describe,
  test,
} from "vitest";
import {
  DESTINATION_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
  PROTOCOL_HEADER_NAME,
  PAYLOAD_HEADER_NAME,
} from "../../src/constants";

const proxyServer = new HttpServer((app) => {
  app.get("/get", (req, res) => {
    res.header("x-powered-by", "apihero");
    res
      .status(200)
      .json({
        proxy: true,
        requestHeaders: req.headers,
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

let proxy;

describe("setupProxy / native fetch", () => {
  beforeAll(async () => {
    await proxyServer.listen();

    proxy = setupProxy({
      projectKey: "hero_abc123",
      url: proxyServer.http.address.href,
    });

    proxy.start();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(async () => {
    proxy.stop();
    await proxyServer.close();
  });

  describe("given I perform a GET request using fetch", () => {
    let res: Response;

    beforeAll(async () => {
      res = await fetch("https://httpbin.org/get");
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

  describe("given I perform a POST request using fetch", () => {
    let res: Response;

    beforeAll(async () => {
      res = await fetch("https://httpbin.org/post", {
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
