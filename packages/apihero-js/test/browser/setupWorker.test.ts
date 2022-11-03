import * as path from "path";
import { pageWith } from "page-with";
import { afterAll, beforeAll, expect, describe, test } from "vitest";
import { HttpServer } from "../support/httpServer";

function prepareRuntime(proxyUrl: string) {
  return pageWith({
    example: path.resolve(__dirname, "setupWorker.example.ts"),
    env: {
      PROXY_URL: proxyUrl,
    },
  });
}

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

describe.skip("setupWorker / fetch", () => {
  beforeAll(async () => {
    await proxyServer.listen();
  });

  afterAll(async () => {
    await proxyServer.close();
  });

  describe("given I perform a GET request using fetch", () => {
    test("should return proxy response", async () => {
      const runtime = await prepareRuntime(proxyServer.https.address.href);

      const res = await runtime.request("https://httpbin.org/get");

      expect(res.status).toEqual(200);
      expect(res.headers["x-powered-by"]).toEqual("apihero");
      const body = await res.json();

      expect(body).toEqual({
        proxy: true,
      });
    });
  });
});
