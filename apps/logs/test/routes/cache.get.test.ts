import { GetCachedResponseSchema } from "internal-logs";
import { test } from "tap";
import { build } from "../helper";

const projectId = "test-project";

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
