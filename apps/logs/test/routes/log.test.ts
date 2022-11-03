import { test } from "tap";
import { build } from "../helper";

test("log is loaded", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/log",
  });

  t.equal(res.payload, "this is a fucking example");
});
