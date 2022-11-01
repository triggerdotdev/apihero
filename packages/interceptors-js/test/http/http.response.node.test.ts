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
import { httpsAgent, HttpServer } from "@open-draft/test-server/http";
import { ClientRequestInterceptor } from "../../src/interceptors/ClientRequest";

const httpServer = new HttpServer((app) => {
  app.get("/", (_req, res) => {
    res.status(200).send("/");
  });
  app.get("/get", (_req, res) => {
    res.status(200).send("/get");
  });
  app.get("/existing", (req, res) => {
    res.status(200).send("/existing");
  });
});

const interceptor = new ClientRequestInterceptor();
interceptor.on("request", (request) => {
  if (request.url.pathname === "/non-existing") {
    request.requestWith({
      url: new URL(httpServer.http.url("/existing")),
    });
  }

  if (request.url.href === "http://error.me/") {
    throw new Error("Custom exception message from requestWith");
  }
});

interceptor.on("connect", (request) => {
  if (request.url.pathname === "/non-existing") {
    if (request.url.protocol === "https:") {
      request.connectWith({
        url: new URL(httpServer.https.url("/existing")),
      });
    } else {
      request.connectWith({
        url: new URL(httpServer.http.url("/existing")),
      });
    }
  }
});

describe("node requesting with", () => {
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

  test('requests to a handled request issued by "http.get"', async () => {
    const req = http.get("http://any.thing/non-existing");
    const { res, text } = await waitForClientRequest(req);

    expect(res.statusCode).toBe(200);
    expect(await text()).toEqual("/existing");
  });

  test('requests to a handled request issued by "https.get"', async () => {
    const req = https.get("https://any.thing/non-existing", {
      agent: httpsAgent,
    });
    const { res, text } = await waitForClientRequest(req);

    expect(res.statusCode).toBe(200);
    expect(await text()).toEqual("/existing");
  });

  test('bypasses an unhandled request issued by "http.get"', async () => {
    const req = http.get(httpServer.http.url("/get"));
    const { res, text } = await waitForClientRequest(req);

    expect(res).toMatchObject<Partial<http.IncomingMessage>>({
      statusCode: 200,
      statusMessage: "OK",
    });
    expect(await text()).toEqual("/get");
  });

  test('bypasses an unhandled request issued by "https.get"', async () => {
    const req = https.get(httpServer.https.url("/get"), { agent: httpsAgent });
    const { res, text } = await waitForClientRequest(req);

    expect(res).toMatchObject<Partial<http.IncomingMessage>>({
      statusCode: 200,
      statusMessage: "OK",
    });
    expect(await text()).toEqual("/get");
  });

  test('responds to a handled request issued by "http.request"', async () => {
    const req = http.request("http://any.thing/non-existing");
    req.end();
    const { res, text } = await waitForClientRequest(req);

    expect(res.statusCode).toBe(200);
    expect(await text()).toEqual("/existing");
  });

  test('responds to a handled request issued by "http.request"', async () => {
    const req = https.request("https://any.thing/non-existing", {
      agent: httpsAgent,
    });
    req.end();
    const { res, text } = await waitForClientRequest(req);

    expect(res.statusCode).toBe(200);
    expect(await text()).toEqual("/existing");
  });

  test('bypasses an unhandled request issued by "http.request"', async () => {
    const req = http.request(httpServer.http.url("/get"));
    req.end();
    const { res, text } = await waitForClientRequest(req);

    expect(res).toMatchObject<Partial<http.IncomingMessage>>({
      statusCode: 200,
      statusMessage: "OK",
    });
    expect(await text()).toEqual("/get");
  });

  test('bypasses an unhandled request issued by "https.request"', async () => {
    const req = https.request(httpServer.https.url("/get"), {
      agent: httpsAgent,
    });
    req.end();
    const { res, text } = await waitForClientRequest(req);

    expect(res).toMatchObject<Partial<http.IncomingMessage>>({
      statusCode: 200,
      statusMessage: "OK",
    });
    expect(await text()).toEqual("/get");
  });

  test("throws a request error when the middleware throws an exception", async () => {
    const req = http.get("http://error.me");
    await waitForClientRequest(req).catch((error) => {
      expect(error.message).toEqual(
        "Custom exception message from requestWith"
      );
    });
  });
});
