import * as path from "path";
import { pageWith } from "page-with";
import { afterAll, beforeAll, expect, describe, test } from "vitest";
import { HttpServer } from "../support/httpServer";

function prepareRuntime(proxyUrl: string) {
  return pageWith({
    example: path.resolve(__dirname, "setupWorker.example.ts"),
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

  app.put("/put", (req, res) => {
    res.header("x-powered-by", "apihero");

    res
      .status(200)
      .json({
        proxy: true,
        body: req.body,
      })
      .end();
  });

  app.delete("/delete", (req, res) => {
    res.header("x-powered-by", "apihero");

    res
      .status(200)
      .json({
        proxy: true,
      })
      .end();
  });

  app.patch("/patch", (req, res) => {
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

describe("setupWorker / fetch", () => {
  beforeAll(async () => {
    await proxyServer.listen();
  });

  afterAll(async () => {
    await proxyServer.close();
  });

  describe("given I perform a GET request using fetch", () => {
    test("should return proxy response", async () => {
      const runtime = await prepareRuntime(proxyServer.http.address.href);

      const res = await runtime.request("http://httpbin.org/get");

      expect(res.status()).toEqual(200);
      expect(res.headers()).toHaveProperty("x-powered-by", "apihero");
    });
  });

  describe("given I perform a POST request using fetch", () => {
    test("should return proxy response", async () => {
      const runtime = await prepareRuntime(proxyServer.http.address.href);

      const res = await runtime.request("http://httpbin.org/post", {
        method: "POST",
        body: JSON.stringify({
          hello: "world",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(res.status()).toEqual(200);
      expect(res.headers()).toHaveProperty("x-powered-by", "apihero");
      expect(await res.json()).toEqual({
        proxy: true,
        body: {
          hello: "world",
        },
      });
    });
  });

  describe("given I perform a PUT request using fetch", () => {
    test("should return proxy response", async () => {
      const runtime = await prepareRuntime(proxyServer.http.address.href);

      const res = await runtime.request("http://httpbin.org/put", {
        method: "PUT",
        body: JSON.stringify({
          hello: "world",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(res.status()).toEqual(200);
      expect(res.headers()).toHaveProperty("x-powered-by", "apihero");
      expect(await res.json()).toEqual({
        proxy: true,
        body: {
          hello: "world",
        },
      });
    });
  });

  describe("given I perform a DELETE request using fetch", () => {
    test("should return proxy response", async () => {
      const runtime = await prepareRuntime(proxyServer.http.address.href);

      const res = await runtime.request("http://httpbin.org/delete", {
        method: "DELETE",
      });

      expect(res.status()).toEqual(200);
      expect(res.headers()).toHaveProperty("x-powered-by", "apihero");
      expect(await res.json()).toEqual({
        proxy: true,
      });
    });
  });

  describe("given I perform a PATCH request using fetch", () => {
    test("should return proxy response", async () => {
      const runtime = await prepareRuntime(proxyServer.http.address.href);

      const res = await runtime.request("http://httpbin.org/patch", {
        method: "PATCH",
        body: JSON.stringify({
          hello: "world",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(res.status()).toEqual(200);
      expect(res.headers()).toHaveProperty("x-powered-by", "apihero");
      expect(await res.json()).toEqual({
        proxy: true,
        body: {
          hello: "world",
        },
      });
    });
  });
});
