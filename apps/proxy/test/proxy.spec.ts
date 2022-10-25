import { expect, test } from "vitest";
import worker from "../src/index";

setupMiniflareIsolatedStorage();

test("Proxying requests to the x-origin-url header", async () => {
  const request = new Request(`http://localhost`, {
    method: "GET",
    headers: {
      "x-origin-url": "https://httpbin.org/get",
    },
  });

  const res = await worker.fetch(request);
  expect(res.status).toBe(200);
  expect(res.ok).toBe(true);
  const json = await res.json();
  expect(json.url).toBe("https://httpbin.org/get");
});
