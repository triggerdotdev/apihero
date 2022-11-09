import { expect, test } from "vitest";
import { proxyRequest } from "../src/proxy";
import {
  DESTINATION_HEADER_NAME,
  PAYLOAD_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
  PROTOCOL_HEADER_NAME,
} from "@apihero/constants-js";

const describe = setupMiniflareIsolatedStorage();

describe("proxy", () => {
  test("Proxying requests to the DESTINATION_HEADER_NAME origin with the PROTOCOL_HEADER_NAME protocol", async () => {
    const request = new Request(`http://localhost/get`, {
      method: "GET",
      headers: {
        [DESTINATION_HEADER_NAME]: "httpbin.org",
        [PROTOCOL_HEADER_NAME]: "https",
        [PROJECT_KEY_HEADER_NAME]: "hero_123",
        [PAYLOAD_HEADER_NAME]: JSON.stringify({ env: "test" }),
        host: "localhost",
        "cf-connecting-ip": "127.0.0.1",
        "cf-ipcountry": "US",
        "cf-ray": "123",
        "cf-visitor": '{"scheme":"https"}',
      },
    });

    const [req, res] = await proxyRequest(request);
    expect(req.url).toBe("https://httpbin.org/get");
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(req.headers.get(DESTINATION_HEADER_NAME)).toBeNull();
    expect(req.headers.get(PROTOCOL_HEADER_NAME)).toBeNull();
    expect(req.headers.get(PROJECT_KEY_HEADER_NAME)).toBeNull();
    expect(req.headers.get(PAYLOAD_HEADER_NAME)).toBeNull();
    expect(req.headers.get("host")).toBeNull();
    expect(req.headers.get("cf-connecting-ip")).toBeNull();
    expect(req.headers.get("cf-ipcountry")).toBeNull();
    expect(req.headers.get("cf-ray")).toBeNull();
    expect(req.headers.get("cf-visitor")).toBeNull();
    const json = await res.json();
    expect((json as any).url).toBe("https://httpbin.org/get");
  });
});
