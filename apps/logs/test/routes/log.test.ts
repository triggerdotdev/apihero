import { test } from "tap";
import { CreateLogBody } from "../../src/types";
import { deleteLogs } from "../../src/utilities/test-utilities";
import { build } from "../helper";

test("create log fail without authentication", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/log",
    method: "POST",
    headers: {},
  });

  t.equal(res.statusCode, 401);
});

test("create log fails with invalid body", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/log",
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.LOGS_API_AUTHENTICATION_TOKEN}`,
    },
    payload: {
      projectId: "project-1",
    },
  });

  t.equal(res.statusCode, 400);
});

test("create log succeeds with valid body", async (t) => {
  const app = await build(t);

  const requestBody: CreateLogBody = {
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

  const res = await app.inject({
    url: "/log",
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.LOGS_API_AUTHENTICATION_TOKEN}`,
    },
    payload: requestBody,
  });

  t.equal(res.statusCode, 200);

  const responseBody = JSON.parse(res.body);

  t.equal(responseBody.success, true);

  const log = responseBody.log;
  t.same(log.projectId, requestBody.projectId);
  t.same(log.method, requestBody.method);
  t.same(log.statusCode, requestBody.statusCode);
  t.same(log.baseUrl, requestBody.baseUrl);
  t.same(log.path, requestBody.path);
  t.same(log.search, requestBody.search);
  t.same(log.requestHeaders, requestBody.requestHeaders);
  t.same(log.responseHeaders, requestBody.responseHeaders);
  t.same(log.responseBody, requestBody.responseBody);
  t.same(log.isCacheHit, requestBody.isCacheHit);
  t.same(log.responseSize, requestBody.responseSize);
  t.same(log.requestDuration, requestBody.requestDuration);
  t.same(log.gatewayDuration, requestBody.gatewayDuration);

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
