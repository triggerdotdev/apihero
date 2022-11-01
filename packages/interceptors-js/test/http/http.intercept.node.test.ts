import http from "http";
import https from "https";
import {
  expect,
  describe,
  test,
  vi,
  beforeAll,
  afterEach,
  afterAll,
} from "vitest";
import { waitForClientRequest } from "../helpers";
import { HttpServer, httpsAgent } from "@open-draft/test-server/http";
import { HttpRequestEventMap } from "../../src/types";
import { ClientRequestInterceptor } from "../../src/interceptors/ClientRequest";
import { encodeBuffer } from "@mswjs/interceptors/lib/utils/bufferUtils";
import { RequestHandler } from "express";

const httpServer = new HttpServer((app) => {
  const handleUserRequest: RequestHandler = (_req, res) => {
    res.status(200).send("user-body").end();
  };
  app.get("/user", handleUserRequest);
  app.post("/user", handleUserRequest);
  app.put("/user", handleUserRequest);
  app.patch("/user", handleUserRequest);
  app.head("/user", handleUserRequest);
});

const resolver = vi.fn<Parameters<HttpRequestEventMap["request"]>>();
const connectionResolver = vi.fn<Parameters<HttpRequestEventMap["connect"]>>();

const interceptor = new ClientRequestInterceptor();
interceptor.on("request", resolver);
interceptor.on("connect", connectionResolver);

describe("node intercepting", () => {
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

  test("intercepts an http.get connection", async () => {
    const url = httpServer.http.url("/user?id=123");
    const req = http.get(url, {
      headers: {
        "x-custom-header": "yes",
      },
    });
    const { text } = await waitForClientRequest(req);

    expect(connectionResolver).toHaveBeenCalledTimes(1);
    expect(connectionResolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "GET",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        connectWith: expect.any(Function),
      })
    );
    expect(await text()).toEqual("user-body");
  });

  test("intercepts an http.get request", async () => {
    const url = httpServer.http.url("/user?id=123");
    const req = http.get(url, {
      headers: {
        "x-custom-header": "yes",
      },
    });
    const { text } = await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "GET",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
    expect(await text()).toEqual("user-body");
  });

  test("intercepts an http.get request given RequestOptions without a protocol", async () => {
    // Create a request with `RequestOptions` without an explicit "protocol".
    // Since request is done via `http.get`, the "http:" protocol must be inferred.
    const req = http.get({
      host: httpServer.http.address.host,
      port: httpServer.http.address.port,
      path: "/user?id=123",
    });
    const { text } = await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "GET",
        url: new URL(httpServer.http.url("/user?id=123")),
        headers: expect.toMatchHeaders({}),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
    expect(await text()).toEqual("user-body");
  });

  test("intercepts a HEAD request", async () => {
    const url = httpServer.http.url("/user?id=123");
    const req = http.request(url, {
      method: "HEAD",
      headers: {
        "x-custom-header": "yes",
      },
    });
    req.end();
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        url: new URL(url),
        method: "HEAD",
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts a GET request", async () => {
    const url = httpServer.http.url("/user?id=123");
    const req = http.request(url, {
      method: "GET",
      headers: {
        "x-custom-header": "yes",
      },
    });
    req.end();
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "GET",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts a POST request", async () => {
    const url = httpServer.http.url("/user?id=123");
    const req = http.request(url, {
      method: "POST",
      headers: {
        "x-custom-header": "yes",
      },
    });
    req.end();
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "POST",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts a PUT request", async () => {
    const url = httpServer.http.url("/user?id=123");
    const req = http.request(url, {
      method: "PUT",
      headers: {
        "x-custom-header": "yes",
      },
    });
    req.end();
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "PUT",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts a PATCH request", async () => {
    const url = httpServer.http.url("/user?id=123");
    const req = http.request(url, {
      method: "PATCH",
      headers: {
        "x-custom-header": "yes",
      },
    });
    req.end();
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "PATCH",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts a DELETE request", async () => {
    const url = httpServer.http.url("/user?id=123");
    const req = http.request(url, {
      method: "DELETE",
      headers: {
        "x-custom-header": "yes",
      },
    });
    req.end();
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "DELETE",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an https GET request", async () => {
    const url = httpServer.https.url("/user?id=123");
    const req = https.get(url, {
      agent: httpsAgent,
      headers: {
        "x-custom-header": "yes",
      },
    });
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "GET",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an https POST request", async () => {
    const url = httpServer.https.url("/user?id=123");
    const req = https.request(url, {
      method: "POST",
      agent: httpsAgent,
      headers: {
        "x-custom-header": "yes",
      },
    });
    req.end();
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "POST",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an https PUT request", async () => {
    const url = httpServer.https.url("/user?id=123");
    const req = https.request(url, {
      method: "PUT",
      agent: httpsAgent,
      headers: {
        "x-custom-header": "yes",
      },
    });
    req.end();
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "PUT",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an https PATCH request", async () => {
    const url = httpServer.https.url("/user?id=123");
    const req = https.request(url, {
      method: "PATCH",
      agent: httpsAgent,
      headers: {
        "x-custom-header": "yes",
      },
    });
    req.end();
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "PATCH",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });

  test("intercepts an https DELETE request", async () => {
    const url = httpServer.https.url("/user?id=123");
    const req = https.request(url, {
      method: "DELETE",
      agent: httpsAgent,
      headers: {
        "x-custom-header": "yes",
      },
    });
    req.end();
    await waitForClientRequest(req);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith<
      Parameters<HttpRequestEventMap["request"]>
    >(
      expect.objectContaining({
        id: expect.toBeAnyUuid(),
        method: "DELETE",
        url: new URL(url),
        headers: expect.toMatchHeaders({
          "x-custom-header": "yes",
        }),
        credentials: "same-origin",
        _body: encodeBuffer(""),
        requestWith: expect.any(Function),
      })
    );
  });
});
