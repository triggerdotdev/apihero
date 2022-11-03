import { test } from "tap";
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

test("create log succeeds", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/log",
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.LOGS_API_AUTHENTICATION_TOKEN}`,
    },
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
