import { test } from "tap";
import { z } from "zod";
import { CreateLogRequestBody } from "../../src/types";
import { deleteLogs } from "../../src/utilities/test-utilities";
import { build } from "../helper";

const validRequestBody: z.infer<typeof CreateLogRequestBody> = {
  projectId: "project-1",
  method: "GET",
  statusCode: 200,
  baseUrl: "https://example.com",
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
};

test("create log fail without authentication", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/logs",
    method: "POST",
    headers: {},
    payload: validRequestBody,
  });

  t.equal(res.statusCode, 400);
});

test("create log fail with wrong authentication", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/logs",
    method: "POST",
    headers: {
      Authorization: `Bearer incorrect`,
    },
    payload: validRequestBody,
  });

  t.equal(res.statusCode, 403);
});

test("create log fails with invalid body", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/logs",
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOGS_API_AUTHENTICATION_TOKEN}`,
    },
    payload: {
      projectId: "project-1",
    },
  });

  t.equal(res.statusCode, 400);
});

test("create log succeeds with valid body", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/logs",
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOGS_API_AUTHENTICATION_TOKEN}`,
    },
    payload: validRequestBody,
  });

  t.equal(res.statusCode, 200);

  const responseBody = JSON.parse(res.body);

  t.equal(responseBody.success, true);

  const log = responseBody.log;
  t.same(log.projectId, validRequestBody.projectId);
  t.same(log.method, validRequestBody.method);
  t.same(log.statusCode, validRequestBody.statusCode);
  t.same(log.baseUrl, validRequestBody.baseUrl);
  t.same(log.path, validRequestBody.path);
  t.same(log.search, validRequestBody.search);
  t.same(log.requestHeaders, validRequestBody.requestHeaders);
  t.same(log.responseHeaders, validRequestBody.responseHeaders);
  t.same(log.responseBody, validRequestBody.responseBody);
  t.same(log.isCacheHit, validRequestBody.isCacheHit);
  t.same(log.responseSize, validRequestBody.responseSize);
  t.same(log.requestDuration, validRequestBody.requestDuration);
  t.same(log.gatewayDuration, validRequestBody.gatewayDuration);

  //clean up
  await deleteLogs([log.id]);
});

// test("get logs", async (t) => {
//   const app = await build(t);

//   const res = await app.inject({
//     url: "/log",
//   });

//   t.equal(res.payload, "this is a fucking example");
// });
