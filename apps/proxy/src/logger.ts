import { CreateLogRequestBody, HttpMethod } from "internal-logs";
import {
  PAYLOAD_HEADER_NAME,
  PROJECT_KEY_HEADER_NAME,
} from "@apihero/constants-js";
import { z } from "zod";

const PayloadSchema = z.object({
  env: z.string(),
});

type Payload = z.infer<typeof PayloadSchema>;

export type LogOptions = {
  url: string;
  authenticationToken: string;
  context?: ExecutionContext;
  debug?: boolean;
  fetch?: typeof fetch;
};

export class LogService {
  private startTime: number;
  private requestDuration = 0;

  constructor(private readonly options: LogOptions) {
    this.startTime = Date.now();
  }

  async measureRequest<ReturnType>(callback: () => ReturnType) {
    const start = Date.now();
    const result = await callback();
    const end = Date.now();

    this.requestDuration = end - start;

    return result;
  }

  async captureEvent(
    request: Request,
    originRequest: Request,
    originResponse: Response
  ): Promise<string | undefined> {
    const projectKey = request.headers.get(PROJECT_KEY_HEADER_NAME);

    if (!projectKey) {
      this.debug(() =>
        this.warn(
          `No project key found in request header ${PROJECT_KEY_HEADER_NAME}`
        )
      );
      return;
    }

    const rawPayload = request.headers.get(PAYLOAD_HEADER_NAME);

    if (!rawPayload) {
      this.debug(() =>
        this.warn(`No payload found in request header ${PAYLOAD_HEADER_NAME}`)
      );
      return;
    }

    const payload = PayloadSchema.safeParse(safeParse(rawPayload));

    if (!payload.success) {
      this.debug(() =>
        this.warn(
          `Payload found in request header ${PAYLOAD_HEADER_NAME} is not valid: ${payload.error}`
        )
      );
      return;
    }

    if (this.shouldSkipLogging(request, originResponse)) {
      this.debug(() => this.log("Skipping logging"));

      return;
    }

    const body = await this.createLogRequestBody(
      request,
      originRequest,
      originResponse,
      payload.data
    );

    if (this.options.context) {
      this.options.context.waitUntil(this.sendLog(projectKey, body));
    } else {
      this.sendLog(projectKey, body);
    }

    return body.requestId;
  }

  private async sendLog(projectKey: string, body: CreateLogRequestBody) {
    const fetch = this.options.fetch || globalThis.fetch;

    const url = new URL(`/logs/${projectKey}`, this.options.url);

    this.debug(() =>
      this.log(
        `Sending log to ${this.options.url}: ${JSON.stringify(body, null, 2)}`
      )
    );

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.options.authenticationToken}`,
      },
      body: JSON.stringify(body),
    });

    await this.debug(() => this.logResponse(response));

    return response;
  }

  private async createLogRequestBody(
    request: Request,
    originRequest: Request,
    originResponse: Response,
    payload: Payload
  ): Promise<CreateLogRequestBody> {
    const originUrl = new URL(originRequest.url);
    const responseHeaders = Object.fromEntries(originResponse.headers);
    const requestHeaders = Object.fromEntries(originRequest.headers);
    const responseBody = await getResponseBody(originResponse);
    const responseSize = extractResponseSize(originResponse, responseBody);
    const requestBody = await getRequestBody(request);

    const gatewayDuration = Date.now() - this.startTime;

    return {
      statusCode: originResponse.status,
      requestId: crypto.randomUUID(),
      method: originRequest.method as HttpMethod,
      baseUrl: originUrl.origin,
      path: originUrl.pathname,
      search: originUrl.search,
      isCacheHit: responseHeaders["cf-cache-status"] === "HIT",
      responseHeaders,
      responseBody,
      requestHeaders: filterRequestHeaders(requestHeaders),
      requestBody: requestBody as any,
      requestDuration: this.requestDuration,
      gatewayDuration,
      responseSize,
      time: new Date().toISOString(),
      environment: payload.env,
    };
  }

  private async logResponse(response: Response) {
    let responseText = "";
    // Read response body, set to empty if fails
    try {
      responseText = await response.text();
    } catch (e) {
      responseText += "";
    }

    // Parse origin from response.url, but at least give some string if parsing fails.
    let origin = "LogService";
    try {
      const originUrl = new URL(response.url);
      origin = originUrl.origin;
    } catch (e) {
      origin = response.url ?? "LogService";
    }

    const msg = `${origin} responded with [${response.status} ${response.statusText}]: ${responseText}`;

    if (response.ok) {
      this.log(msg);
    } else {
      this.error(msg);
    }
  }

  // Only log responses that are json
  private shouldSkipLogging(request: Request, response: Response) {
    const contentType = caseInsensitiveGet(response.headers, "content-type");

    if (!contentType) {
      return true;
    }

    if (!contentType.startsWith("application/json")) {
      return true;
    }

    return false;
  }

  /**
   * Runs a callback if debug === true.
   * Use this to delay execution of debug logic, to ensure toucan doesn't burn I/O in non-debug mode.
   *
   * @param callback
   */
  private debug<ReturnType>(callback: () => ReturnType) {
    if (this.options.debug) {
      return callback();
    }
  }

  private log(message: unknown) {
    console.log(`apihero-proxy: ${message}`);
  }

  private warn(message: unknown) {
    console.warn(`apihero-proxy: ${message}`);
  }

  private error(message: unknown) {
    console.error(`apihero-proxy: ${message}`);
  }
}

export function filterRequestHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const filteredHeaders: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === "authorization") {
      filteredHeaders[key] = obfuscateAuthorizationHeader(value);
    } else {
      filteredHeaders[key] = value;
    }
  }

  return filteredHeaders;
}

function obfuscateAuthorizationHeader(value: string) {
  const [type, token] = value.split(" ");

  if (type && token) {
    return `${type} ${"*".repeat(12)}`;
  }

  return "*".repeat(12);
}

export function extractResponseSize(
  response: Response | undefined,
  responseBody?: any
): number {
  if (!response) {
    return 0;
  }

  if (response.headers.has("Content-Length")) {
    return Number(response.headers.get("Content-Length"));
  }

  if (responseBody) {
    return JSON.stringify(responseBody).length;
  }

  return 0;
}

async function getRequestBody(request: Request) {
  if (request.method === "POST" || request.method === "PUT") {
    return request.json();
  }
}

async function getResponseBody(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch (e) {
    return null;
  }
}

function caseInsensitiveGet(headers: Headers, key: string): string | undefined {
  for (const [headerKey, value] of headers) {
    if (headerKey.toLowerCase() === key.toLowerCase()) {
      return value;
    }
  }
}

function safeParse(body: string) {
  try {
    return JSON.parse(body);
  } catch (e) {
    return {};
  }
}
