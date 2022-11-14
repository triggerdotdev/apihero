import cuid from "cuid";
import {
  GetCachedResponseSchema,
  GetCachedSuccessResponseSchema,
  Log,
} from "internal-logs";
import { test } from "tap";
import {
  createLogs,
  deleteLogsForProject,
} from "../../src/utilities/test-utilities";
import { build } from "../helper";

const projectId = "tap-test-cache-project";

test("get logs, no results", async (t) => {
  const app = await build(t);

  const url = `caching/${projectId}-none`;

  const res = await app.inject({
    url,
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.API_AUTHENTICATION_TOKEN}`,
    },
  });

  t.equal(res.statusCode, 200);

  const responseBody = JSON.parse(res.body);
  const body = GetCachedResponseSchema.parse(responseBody);

  if ("records" in body) {
    t.equal(body.records.length, 0);
  } else {
    throw new Error("No records found");
  }
});

test("get logs, with results", async (t) => {
  const app = await build(t);

  const url = `caching/${projectId}`;

  //create logs
  const logs: Log[] = [
    //github.com 2/5 cached
    log("https://api.github.com", true, 10),
    log("https://api.github.com", true, 20),
    log("https://api.github.com", false, 100),
    log("https://api.github.com", false, 130),
    log("https://api.github.com", false, 200),
    //example.com 3/4 cached
    log("https://api.example.com", true, 20),
    log("https://api.example.com", true, 30),
    log("https://api.example.com", true, 23),
    log("https://api.example.com", false, 120),
    //cached.com 1/1 cached
    log("https://api.cached.com", true, 13),
    //nocache.com 0/1 cached
    log("https://api.nocache.com", false, 224),
  ];

  await createLogs(logs);

  const res = await app.inject({
    url,
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.API_AUTHENTICATION_TOKEN}`,
    },
  });

  await deleteLogsForProject(projectId);

  t.equal(res.statusCode, 200);

  const responseBody = JSON.parse(res.body);
  const body = GetCachedSuccessResponseSchema.parse(responseBody);

  t.equal(body.records.length, 4);

  t.equal(body.records[0].baseUrl, "https://api.cached.com");
  t.equal(body.records[1].baseUrl, "https://api.example.com");
  t.equal(body.records[2].baseUrl, "https://api.github.com");
  t.equal(body.records[3].baseUrl, "https://api.nocache.com");

  const github = body.records[2];
  t.same(github, {
    baseUrl: "https://api.github.com",
    api: "api.github.com",
    total: 5,
    hitCount: 2,
    missCount: 3,
    hitRate: 2 / 5,
    hitP50Time: 15,
    missP50Time: 130,
    hitP95Time: 19.5,
    missP95Time: 193,
  });

  const cachedApi = body.records[0];
  t.same(cachedApi, {
    baseUrl: "https://api.cached.com",
    api: "api.cached.com",
    total: 1,
    hitCount: 1,
    missCount: 0,
    hitRate: 1,
    hitP50Time: 13,
    missP50Time: 0,
    hitP95Time: 13,
    missP95Time: 0,
  });

  const noCacheApi = body.records[3];
  t.same(noCacheApi, {
    baseUrl: "https://api.nocache.com",
    api: "api.nocache.com",
    total: 1,
    hitCount: 0,
    missCount: 1,
    hitRate: 0,
    hitP50Time: 0,
    missP50Time: 224,
    hitP95Time: 0,
    missP95Time: 224,
  });

  const exampleApi = body.records[1];
  t.same(exampleApi, {
    baseUrl: "https://api.example.com",
    api: "api.example.com",
    total: 4,
    hitCount: 3,
    missCount: 1,
    hitRate: 3 / 4,
    hitP50Time: 23,
    missP50Time: 120,
    hitP95Time: 29.3,
    missP95Time: 120,
  });
});

function log(baseUrl: string, isCacheHit: boolean, duration: number): Log {
  const log: Log = {
    baseUrl,
    projectId,
    isCacheHit,
    gatewayDuration: duration,
    id: cuid(),
    requestId: cuid(),
    path: "/path",
    method: "GET",
    statusCode: 200,
    search: "",
    requestHeaders: {},
    responseHeaders: {},
    responseSize: 0,
    requestDuration: duration,
    time: new Date().toISOString(),
    environment: "test",
  };

  return log;
}
