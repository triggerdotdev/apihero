import { expect, test } from "vitest";
import { proxyRequest } from "../src/proxy";
import { DESTINATION_HEADER_NAME } from "@apihero/constants-js";

const describe = setupMiniflareIsolatedStorage();

describe("proxy", () => {
  test("Proxying requests to the x-destination-origin header", async () => {
    const request = new Request(`http://localhost/get`, {
      method: "GET",
      headers: {
        [DESTINATION_HEADER_NAME]: "https://httpbin.org",
      },
    });

    const [req, res] = await proxyRequest(request);
    expect(req.url).toBe("http://localhost/get");
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect((json as any).url).toBe("https://httpbin.org/get");
  });
});
