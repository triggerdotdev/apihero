import fetch from "node-fetch";
import { expect, test, describe, afterAll, beforeAll } from "vitest";
import { httpsAgent, HttpServer } from "@open-draft/test-server/http";
import { ClientRequestInterceptor } from "../../src/interceptors/ClientRequest";

const httpServer = new HttpServer((app) => {
  app.get("/", (req, res) => {
    res.status(500).json({ error: "must use requestWith" });
  });
  app.get("/get", (req, res) => {
    res.status(200).json({ route: "/get" }).end();
  });
});

const interceptor = new ClientRequestInterceptor();
interceptor.on("request", (request) => {
  if (
    [httpServer.http.url(), httpServer.https.url()].includes(request.url.href)
  ) {
    request.requestWith({ url: new URL("/get", request.url.href) });
  }
});

describe("requestWith fetch in node with ClientRequestInterceptor", () => {
  beforeAll(async () => {
    await httpServer.listen();
    interceptor.apply();
  });

  afterAll(async () => {
    interceptor.dispose();
    await httpServer.close();
  });

  test("requests with an HTTP request that is handled in the middleware", async () => {
    const res = await fetch(httpServer.http.url("/"));
    const body = await res.json();

    expect(res.status).toEqual(200);
    expect(body).toEqual({
      route: "/get",
    });
  });

  test("bypasses an HTTP request not handled in the middleware", async () => {
    const res = await fetch(httpServer.http.url("/get"));
    const body = await res.json();

    expect(res.status).toEqual(200);
    expect(body).toEqual({ route: "/get" });
  });

  test("responds to an HTTPS request that is handled in the middleware", async () => {
    const res = await fetch(httpServer.https.url("/"), {
      agent: httpsAgent,
    });
    const body = await res.json();

    expect(res.status).toEqual(200);
    expect(body).toEqual({
      route: "/get",
    });
  });

  test("bypasses an HTTPS request not handled in the middleware", async () => {
    const res = await fetch(httpServer.https.url("/get"), {
      agent: httpsAgent,
    });
    const body = await res.json();

    expect(res.status).toEqual(200);
    expect(body).toEqual({ route: "/get" });
  });

  test("does not throw an error if there are multiple interceptors", async () => {
    const secondInterceptor = new ClientRequestInterceptor();
    secondInterceptor.apply();

    const res = await fetch(httpServer.https.url("/get"), {
      agent: httpsAgent,
    });
    const body = await res.json();

    expect(res.status).toEqual(200);
    expect(body).toEqual({ route: "/get" });

    secondInterceptor.dispose();
  });
});
