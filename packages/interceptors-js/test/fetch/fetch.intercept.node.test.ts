import fetch from "node-fetch";
import {
  expect,
  test,
  describe,
  vi,
  afterAll,
  afterEach,
  beforeAll,
} from "vitest";
import { ClientRequestInterceptor } from "../../src/interceptors/ClientRequest";
import { RequestHandler } from "express";
import { HttpServer, httpsAgent } from "@open-draft/test-server/http";
import { HttpRequestEventMap } from "../../src/types";
import { encodeBuffer } from "@mswjs/interceptors/lib/utils/bufferUtils";

const httpServer = new HttpServer((app) => {
  const handleUserRequest: RequestHandler = (_req, res) => {
    res.status(200).send("user-body").end();
  };

  app.get("/user", handleUserRequest);
  app.post("/user", handleUserRequest);
  app.put("/user", handleUserRequest);
  app.delete("/user", handleUserRequest);
  app.patch("/user", handleUserRequest);
  app.head("/user", handleUserRequest);
});

const resolver = vi.fn<Parameters<HttpRequestEventMap["request"]>>();

const interceptor = new ClientRequestInterceptor();
interceptor.on("request", resolver);

describe("intercepting fetch in node with ClientRequestInterceptor", () => {
  beforeAll(async () => {
    await httpServer.listen();

    interceptor.apply();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(async () => {
    interceptor.dispose();
    await httpServer.close();
  });

  test("intercepts an HTTP HEAD request", async () => {
    await fetch(httpServer.http.url("/user?id=123"), {
      method: "HEAD",
      headers: {
        "x-custom-header": "yes",
      },
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "HEAD",
        url: new URL(httpServer.http.url("/user?id=123")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTP GET request", async () => {
    await fetch(httpServer.http.url("/user?id=123"), {
      headers: {
        "x-custom-header": "yes",
      },
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "GET",
        url: new URL(httpServer.http.url("/user?id=123")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTP POST request", async () => {
    await fetch(httpServer.http.url("/user"), {
      method: "POST",
      headers: {
        "x-custom-header": "yes",
      },
      body: "post-body",
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "POST",
        url: new URL(httpServer.http.url("/user")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer("post-body"),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTP PUT request", async () => {
    await fetch(httpServer.http.url("/user"), {
      method: "PUT",
      headers: {
        "x-custom-header": "yes",
      },
      body: "put-body",
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "PUT",
        url: new URL(httpServer.http.url("/user")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer("put-body"),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTP DELETE request", async () => {
    await fetch(httpServer.http.url("/user"), {
      method: "DELETE",
      headers: {
        "x-custom-header": "yes",
      },
      body: "delete-body",
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "DELETE",
        url: new URL(httpServer.http.url("/user")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer("delete-body"),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTP PATCH request", async () => {
    await fetch(httpServer.http.url("/user"), {
      method: "PATCH",
      headers: {
        "x-custom-header": "yes",
      },
      body: "patch-body",
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "PATCH",
        url: new URL(httpServer.http.url("/user")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer("patch-body"),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTPS HEAD request", async () => {
    await fetch(httpServer.https.url("/user?id=123"), {
      agent: httpsAgent,
      method: "HEAD",
      headers: {
        "x-custom-header": "yes",
      },
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "HEAD",
        url: new URL(httpServer.https.url("/user?id=123")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTPS GET request", async () => {
    await fetch(httpServer.https.url("/user?id=123"), {
      agent: httpsAgent,
      headers: {
        "x-custom-header": "yes",
      },
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "GET",
        url: new URL(httpServer.https.url("/user?id=123")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTPS POST request", async () => {
    await fetch(httpServer.https.url("/user"), {
      agent: httpsAgent,
      method: "POST",
      headers: {
        "x-custom-header": "yes",
      },
      body: "post-body",
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "POST",
        url: new URL(httpServer.https.url("/user")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer("post-body"),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTPS PUT request", async () => {
    await fetch(httpServer.https.url("/user"), {
      agent: httpsAgent,
      method: "PUT",
      headers: {
        "x-custom-header": "yes",
      },
      body: "put-body",
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "PUT",
        url: new URL(httpServer.https.url("/user")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer("put-body"),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTPS DELETE request", async () => {
    await fetch(httpServer.https.url("/user"), {
      agent: httpsAgent,
      method: "DELETE",
      headers: {
        "x-custom-header": "yes",
      },
      body: "delete-body",
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "DELETE",
        url: new URL(httpServer.https.url("/user")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer("delete-body"),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an HTTPS PATCH request", async () => {
    await fetch(httpServer.https.url("/user"), {
      agent: httpsAgent,
      method: "PATCH",
      headers: {
        "x-custom-header": "yes",
      },
      body: "patch-body",
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "PATCH",
        url: new URL(httpServer.https.url("/user")),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer("patch-body"),
        requestWith: expect.any(Function),
      })
    );
  });
});
