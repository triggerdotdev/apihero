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
    log("https://api.github.com", true, 10),
    log("https://api.github.com", true, 20),
    log("https://api.github.com", false, 100),
    log("https://api.github.com", false, 130),
    log("https://api.github.com", false, 200),
    log("https://api.example.com", true, 20),
    log("https://api.example.com", true, 30),
    log("https://api.example.com", true, 23),
    log("https://api.example.com", false, 120),
    log("https://api.cached.com", true, 13),
    log("https://api.nocache.com", true, 224),
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
