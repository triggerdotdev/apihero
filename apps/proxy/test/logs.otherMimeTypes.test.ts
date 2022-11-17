import { expect, test, vi, afterEach } from "vitest";
import { LogService } from "../src/logger";
import {
  DESTINATION_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
} from "../src/constants";

const describe = setupMiniflareIsolatedStorage();

const mockFetch = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();

describe("LogService / sendProxiedRequestEvent", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("given a GET request", () => {
    describe("that responds with text/html", () => {
      test("does not send event data for the proxied request", async () => {
        const request = new Request(`http://localhost/`, {
          method: "GET",
          headers: {
            [DESTINATION_HEADER_NAME]: "https://apihero.run",
            [PROJECT_KEY_HEADER_NAME]: "hero_123",
          },
        });

        const originRequest = new Request(`https://apihero.run`, {
          method: "GET",
        });

        const responseBody = `<!DOCTYPE html>`;

        const response = new Response(responseBody, {
          status: 200,
          statusText: "OK",
          headers: {
            "Content-Type": "text/html",
          },
        });

        const logger = new LogService({
          url: "https://logs.apihero.dev",
          authenticationToken: "secret_123",
          fetch: mockFetch,
        });

        const requestId = await logger.captureEvent(
          request,
          originRequest,
          response
        );

        expect(mockFetch).toHaveBeenCalledTimes(0);
        expect(requestId).toBeUndefined();
      });
    });
  });
});
