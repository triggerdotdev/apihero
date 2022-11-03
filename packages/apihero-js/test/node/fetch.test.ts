import fetch, { Response } from "node-fetch";
import https from "https";
import { HttpServer } from "../support/httpServer";
import { setupProxy } from "../../src/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  expect,
  vi,
  describe,
  test,
} from "vitest";

const proxyServer = new HttpServer((app) => {
  app.get("/get", (_req, res) => {
    res.header("x-powered-by", "apihero");
    res
      .status(200)
      .json({
        proxy: true,
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
      })
      .end();
  });
});

let proxy;

const agent = new https.Agent({
  rejectUnauthorized: false,
});

describe("setupProxy / fetch", () => {
  beforeAll(async () => {
    await proxyServer.listen();

    proxy = setupProxy({
      projectKey: "hero_abc123",
      url: proxyServer.https.address.href,
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
      res = await fetch("https://httpbin.org/get", { agent });
    });

    test("should return proxy status code", async () => {
      expect(res.status).toEqual(200);
    });

    test("should return proxy headers", () => {
      expect(res.headers.get("x-powered-by")).toEqual("apihero");
    });

    test("should return proxied body", async () => {
      const body = await res.json();

      expect(body).toEqual({
        proxy: true,
      });
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
        agent,
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
      expect(body).toMatchInlineSnapshot(`
        {
          "body": {
            "payload": "info",
          },
          "proxy": true,
        }
      `);
    });
  });
});
