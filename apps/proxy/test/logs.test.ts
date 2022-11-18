import { expect, test, vi, afterEach } from "vitest";
import { LogService } from "../src/logger";
import {
  DESTINATION_HEADER_NAME,
  PAYLOAD_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
} from "../src/constants";

const describe = setupMiniflareIsolatedStorage();

const mockFetch = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();

describe("LogService / sendProxiedRequestEvent", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("given a POST request", () => {
    describe("with a JSON request body", () => {
      test("sends event data for the proxied request", async () => {
        const request = new Request(`http://localhost/post`, {
          method: "POST",
          headers: {
            [DESTINATION_HEADER_NAME]: "https://httpbin.org",
            [PROJECT_KEY_HEADER_NAME]: "hero_123",
            [PAYLOAD_HEADER_NAME]: JSON.stringify({ env: "test" }),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ foo: "bar" }),
        });

        const originRequest = new Request(`https://httpbin.org/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: request.body,
        });

        const responseBody = `{"args":{},"data":"{ \\"foo\\": \\"bar\\" }","files":{},"form":{},"headers":{"Accept":"*/*","Content-Length":"16","Content-Type":"application/json","Host":"httpbin.org","User-Agent":"insomnia/2022.6.0","X-Amzn-Trace-Id":"Root=1-636b97c8-7990e7652292644f7df796ef"},"json":{"foo":"bar"},"origin":"167.98.145.180","url":"https://httpbin.org/post"}`;

        const response = new Response(responseBody, {
          status: 200,
          statusText: "OK",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": "434",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
          },
        });

        const logger = new LogService({
          url: "https://logs.apihero.dev",
          authenticationToken: "secret_123",
          fetch: mockFetch,
        });

        const requestId = await logger.captureEvent(
          request,
          await request.text(),
          originRequest,
          response
        );

        expect(mockFetch).toHaveBeenCalledOnce();

        const [url, requestInit] = mockFetch.mock.lastCall!;

        expect(url).toBe("https://logs.apihero.dev/logs/hero_123");
        expect(requestInit).toEqual(
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              Authorization: "Bearer secret_123",
            }),
            body: expect.any(String),
          })
        );

        const body = JSON.parse(requestInit!.body as string);

        expect(body).toEqual(
          expect.objectContaining({
            requestId,
            method: "POST",
            path: "/post",
            baseUrl: "https://httpbin.org",
            requestHeaders: expect.objectContaining({
              "content-type": "application/json",
            }),
            requestBody: {
              foo: "bar",
            },
            responseHeaders: expect.objectContaining({
              "content-type": "application/json",
              "content-length": "434",
              "access-control-allow-origin": "*",
              "access-control-allow-credentials": "true",
            }),
            responseBody: JSON.parse(responseBody),
            gatewayDuration: expect.any(Number),
            isCacheHit: false,
            search: "",
            statusCode: 200,
            requestDuration: expect.any(Number),
            time: expect.any(String),
            responseSize: 434,
            environment: "test",
          })
        );
      });

      test("sends event data even if the request has already been used to make a fetch", async () => {
        const request = new Request(`http://localhost/post`, {
          method: "POST",
          headers: {
            [DESTINATION_HEADER_NAME]: "https://httpbin.org",
            [PROJECT_KEY_HEADER_NAME]: "hero_123",
            [PAYLOAD_HEADER_NAME]: JSON.stringify({ env: "test" }),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ foo: "bar" }),
        });

        const originRequest = new Request(`https://httpbin.org/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: request.clone().body,
        });

        const response = new Response("{}", {
          status: 200,
          statusText: "OK",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const logger = new LogService({
          url: "https://logs.apihero.dev",
          authenticationToken: "secret_123",
          fetch: mockFetch,
        });

        await originRequest.json();

        const requestId = await logger.captureEvent(
          request,
          await request.text(),
          originRequest,
          response
        );

        expect(mockFetch).toHaveBeenCalledOnce();

        const [url, requestInit] = mockFetch.mock.lastCall!;

        expect(url).toBe("https://logs.apihero.dev/logs/hero_123");
        expect(requestInit).toEqual(
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              Authorization: "Bearer secret_123",
            }),
            body: expect.any(String),
          })
        );

        const body = JSON.parse(requestInit!.body as string);

        expect(body).toEqual(
          expect.objectContaining({
            requestBody: {
              foo: "bar",
            },
          })
        );
      });
    });
  });

  describe("given a GET request", () => {
    test("does not send event data with a project key", async () => {
      const request = new Request(`http://localhost/get`, {
        method: "GET",
        headers: {
          [DESTINATION_HEADER_NAME]: "https://httpbin.org",
          [PAYLOAD_HEADER_NAME]: JSON.stringify({ env: "test" }),
        },
      });

      const originRequest = new Request(`https://httpbin.org/get`, {
        method: "GET",
      });

      const response = new Response("{}", {
        status: 200,
        statusText: "OK",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const logger = new LogService({
        url: "https://logs.apihero.dev",
        authenticationToken: "secret_123",
        fetch: mockFetch,
      });

      const requestId = await logger.captureEvent(
        request,
        await request.text(),
        originRequest,
        response
      );

      expect(requestId).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("sends event data for the proxied request", async () => {
      const request = new Request(`http://localhost/get`, {
        method: "GET",
        headers: {
          [DESTINATION_HEADER_NAME]: "httpbin.org",
          [PROJECT_KEY_HEADER_NAME]: "hero_123",
          [PAYLOAD_HEADER_NAME]: JSON.stringify({ env: "test" }),
        },
      });

      const originRequest = new Request(`https://httpbin.org/get`, {
        method: "GET",
      });

      const responseBody = `{
  "args": {}, 
  "headers": {
    "Accept": "*/*", 
    "Host": "httpbin.org", 
    "User-Agent": "insomnia/2022.6.0", 
    "X-Amzn-Trace-Id": "Root=1-636b7c1c-62f164c21155177179d3a5ec"
  }, 
  "origin": "167.98.145.180", 
  "url": "https://httpbin.org/get"
}`;

      const response = new Response(responseBody, {
        status: 200,
        statusText: "OK",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": "262",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
      });

      const logger = new LogService({
        url: "https://logs.apihero.dev",
        authenticationToken: "secret_123",
        fetch: mockFetch,
      });

      const requestId = await logger.captureEvent(
        request,
        await request.text(),
        originRequest,
        response
      );

      expect(mockFetch).toHaveBeenCalledOnce();

      const [url, requestInit] = mockFetch.mock.lastCall!;

      expect(url).toBe("https://logs.apihero.dev/logs/hero_123");
      expect(requestInit).toEqual(
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer secret_123",
          }),
          body: expect.any(String),
        })
      );

      const body = JSON.parse(requestInit!.body as string);

      expect(body).toEqual(
        expect.objectContaining({
          requestId,
          method: "GET",
          path: "/get",
          baseUrl: "https://httpbin.org",
          requestHeaders: {},
          responseHeaders: expect.objectContaining({
            "content-type": "application/json",
            "content-length": "262",
            "access-control-allow-origin": "*",
            "access-control-allow-credentials": "true",
          }),
          responseBody: JSON.parse(responseBody),
          gatewayDuration: expect.any(Number),
          isCacheHit: false,
          search: "",
          statusCode: 200,
          requestDuration: expect.any(Number),
          time: expect.any(String),
          responseSize: 262,
          environment: "test",
        })
      );
    });
  });
});
