import { expect, test } from "vitest";
import { createResponse } from "../src/response";
import {
  DESTINATION_HEADER_NAME,
  REQUEST_ID_HEADER_NAME,
} from "@apihero/constants-js";

const describe = setupMiniflareIsolatedStorage();

describe("createResponse", () => {
  test("returns a new response with certain headers stripped and the requestId", async () => {
    const responseBody = JSON.stringify({ hello: "world" });
    const response = new Response(responseBody, {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(responseBody.length),
        Connection: "keep-alive",
        Date: "Mon, 01 Feb 2021 00:00:00 GMT",
        Server: "cloudflare",
        "Strict-Transport-Security":
          "max-age=31536000; includeSubDomains; preload",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
      },
    });

    const requestId = "request_123";

    const finalResponse = createResponse(response, requestId);

    expect(finalResponse.status).toBe(200);
    expect(finalResponse.statusText).toBe("OK");
    expect(finalResponse.headers.get(REQUEST_ID_HEADER_NAME)).toBe(requestId);
    expect(finalResponse.headers.get("Content-Type")).toBe("application/json");
    expect(finalResponse.headers.get("Connection")).toBeNull();
    expect(finalResponse.headers.get("Date")).toBeNull();
    expect(finalResponse.headers.get("Server")).toBeNull();
    expect(finalResponse.headers.get("Strict-Transport-Security")).toBeNull();
    expect(finalResponse.headers.get("Transfer-Encoding")).toBeNull();
  });
});
