import * as path from "path";
import { pageWith } from "page-with";
import { afterAll, beforeAll, expect, describe, test } from "vitest";
import { HttpServer } from "../support/httpServer";

function prepareRuntime(proxyUrl: string) {
  return pageWith({
    example: path.resolve(__dirname, "setupWorker.noAllow.example.ts"),
    title: proxyUrl,
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
});

describe("setupWorker / fetch / noAllow", () => {
  beforeAll(async () => {
    await proxyServer.listen();
  });

  afterAll(async () => {
    await proxyServer.close();
  });

  describe("given I perform a GET request using fetch", () => {
    test("should NOT proxy the request, allow is required in setupWorker", async () => {
      const runtime = await prepareRuntime(proxyServer.http.address.href);

      const res = await runtime.request("http://httpbin.org/get");

      expect(res.status()).toEqual(200);
      expect(res.headers()).not.toHaveProperty("x-powered-by", "apihero");
    });
  });
});
