import fetch, { Response } from "node-fetch";
import https from "https";
import { HttpServer } from "../support/httpServer";
import { setupProxy } from "../../src";
import { afterAll, beforeAll, expect, describe, test } from "vitest";

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

  app.post("/v3/apihero.run/messages", (req, res) => {
    res.header("x-powered-by", "apihero-mailgun");

    res
      .status(200)
      .json({
        proxy: true,
      })
      .end();
  });
});

let proxy;

const agent = new https.Agent({
  rejectUnauthorized: false,
});

describe("setupProxy / fetch / allow", () => {
  describe("*api.mailgun.net/*", () => {
    beforeAll(async () => {
      await proxyServer.listen();

      proxy = setupProxy({
        projectKey: "hero_abc123",
        url: proxyServer.https.address.href,
        allow: ["https://api.mergent.co/v2/*", "*api.mailgun.net/*"],
      });

      proxy.start();
    });

    afterAll(async () => {
      proxy.stop();
      await proxyServer.close();
    });

    describe("given I perform a POST request to https://api:password@api.mailgun.net/v3/apihero.run/messages", () => {
      let res: Response;

      beforeAll(async () => {
        res = await fetch(
          "https://api:password@api.mailgun.net/v3/apihero.run/messages",
          {
            agent,
            method: "POST",
            body: JSON.stringify({ hello: "world" }),
          }
        );
      });

      test("should return proxy status code", async () => {
        expect(res.status).toEqual(200);
      });

      test("should return proxy headers", () => {
        expect(res.headers.get("x-powered-by")).toEqual("apihero-mailgun");
      });

      test("should return proxied body", async () => {
        const body = await res.json();

        expect(body).toEqual({
          proxy: true,
        });
      });
    });
  });

  describe("https://httpbin.org/*", () => {
    beforeAll(async () => {
      await proxyServer.listen();

      proxy = setupProxy({
        projectKey: "hero_abc123",
        url: proxyServer.https.address.href,
        allow: ["https://httpbin.org/*"],
      });

      proxy.start();
    });

    afterAll(async () => {
      proxy.stop();
      await proxyServer.close();
    });

    describe("given I perform a GET request to https://httpbin.org/get", () => {
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

    describe("given I perform a POST request to https://httpbin.org/post", () => {
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

  describe("https://httpbin.org/get", () => {
    beforeAll(async () => {
      await proxyServer.listen();

      proxy = setupProxy({
        projectKey: "hero_abc123",
        url: proxyServer.https.address.href,
        allow: ["https://httpbin.org/get"],
      });

      proxy.start();
    });

    afterAll(async () => {
      proxy.stop();
      await proxyServer.close();
    });

    describe("given I perform a GET request to https://httpbin.org/get", () => {
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

    describe("given I perform a POST request to https://httpbin.org/post", () => {
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

      test("should return real status code", () => {
        expect(res.status).toEqual(200);
      });

      test("should return real headers", () => {
        expect(res.headers.get("x-powered-by")).toBeNull();
      });

      test("should return real body", async () => {
        const body = await res.json();
        expect(body.json).toMatchInlineSnapshot(`
          {
            "payload": "info",
          }
        `);
      });
    });
  });

  describe("url: https://httpbin.org/* method: GET", () => {
    beforeAll(async () => {
      await proxyServer.listen();

      proxy = setupProxy({
        projectKey: "hero_abc123",
        url: proxyServer.https.address.href,
        allow: [{ url: "https://httpbin.org/*", method: "GET" }],
      });

      proxy.start();
    });

    afterAll(async () => {
      proxy.stop();
      await proxyServer.close();
    });

    describe("given I perform a GET request to https://httpbin.org/get", () => {
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

    describe("given I perform a POST request to https://httpbin.org/post", () => {
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

      test("should return real status code", () => {
        expect(res.status).toEqual(200);
      });

      test("should return real headers", () => {
        expect(res.headers.get("x-powered-by")).toBeNull();
      });

      test("should return real body", async () => {
        const body = await res.json();
        expect(body.json).toMatchInlineSnapshot(`
          {
            "payload": "info",
          }
        `);
      });
    });
  });
});
