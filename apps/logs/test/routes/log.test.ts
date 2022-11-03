import { test } from "tap";
import { CreateLogBody } from "../../src/types";
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
    body: {
      projectId: "project-1",
    },
  });

  t.equal(res.statusCode, 400);
});

test("create log succeeds with valid body", async (t) => {
  const app = await build(t);

  const body: CreateLogBody = {
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
    body,
  });

  t.equal(res.statusCode, 200);
});

// test("get logs", async (t) => {
//   const app = await build(t);

//   const res = await app.inject({
//     url: "/log",
//   });

//   t.equal(res.payload, "this is a fucking example");
// });
