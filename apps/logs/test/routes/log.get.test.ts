import { test } from "tap";
import { z } from "zod";
import { CreateLogRequestBody, GetLogsSuccessResponse } from "../../src/types";
import { deleteLogs } from "../../src/utilities/test-utilities";
import { build } from "../helper";

const projectId = "test-project";

test("get logs fail without authentication", async (t) => {
  const app = await build(t);

  const url = `logs/${projectId}`;

  const res = await app.inject({
    url,
    method: "GET",
    headers: {},
  });

  t.equal(res.statusCode, 400);
});

test("get log fail with wrong authentication", async (t) => {
  const app = await build(t);

  const url = `logs/${projectId}`;

  const res = await app.inject({
    url,
    query: {
      days: "7",
      page: "1",
    },
    method: "GET",
    headers: {
      Authorization: `Bearer incorrect`,
    },
  });

  t.equal(res.statusCode, 403);
});

test("get logs, no results", async (t) => {
  const app = await build(t);

  const url = `logs/${projectId}-none`;

  const res = await app.inject({
    url,
    query: {
      days: "7",
      page: "1",
    },
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.API_AUTHENTICATION_TOKEN}`,
    },
  });

  t.equal(res.statusCode, 200);

  const responseBody = JSON.parse(res.body);
  const body = GetLogsSuccessResponse.parse(responseBody);

  t.equal(body.logs.length, 0);
});

test("create logs, get logs", async (t) => {
  const app = await build(t);

  const url = `logs/${projectId}-some`;

  //create logs
  const logInput = [
    { api: "api-1.com", date: new Date() },
    { api: "api-2.com", date: new Date() },
    { api: "api-1.com", date: new Date() },
    { api: "api-3.com", date: new Date() },
  ];
  const createdLogs = await Promise.all(
    logInput.map(
      async (log) =>
        await app.inject({
          url,
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.API_AUTHENTICATION_TOKEN}`,
          },
          payload: createLog(log.api, log.date),
        })
    )
  );

  const res = await app.inject({
    url,
    query: {
      days: "7",
      page: "1",
    },
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.API_AUTHENTICATION_TOKEN}`,
    },
  });

  //delete created logs
  const createdLogIds = createdLogs.map((log) => JSON.parse(log.body).log.id);
  console.log(createdLogIds);
  await deleteLogs(createdLogIds);

  t.equal(res.statusCode, 200);

  const responseBody = JSON.parse(res.body);
  const body = GetLogsSuccessResponse.parse(responseBody);

  t.equal(body.logs.length, createdLogs.length);
});

type CreateBodyType = z.infer<typeof CreateLogRequestBody>;

function createLog(api: string, date: Date): CreateBodyType {
  return {
    method: "GET",
    statusCode: 200,
    baseUrl: `https://${api}`,
    path: "/",
    search: "",
    requestHeaders: {
      "user-agent": "test",
    },

    responseHeaders: {
      "content-type": "application/json",
    },
    responseBody: {
      foo: "bar",
    },
    isCacheHit: false,
    responseSize: 100,
    requestDuration: 100,
    gatewayDuration: 120,
    time: date.toISOString(),
  };
}
