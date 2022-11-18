import { LogService } from "./logger";
import { proxyRequest } from "./proxy";
import { createResponse } from "./response";

export default {
  async fetch(
    request: Request,
    env: Bindings,
    context: ExecutionContext
  ): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, CONNECT, TRACE",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const logService = new LogService({
      url: env.LOGS_URL,
      context: context,
      authenticationToken: env.LOGS_AUTHENTICATION_TOKEN,
      debug: env.LOGS_DEBUG,
    });

    const requestBody = await getRequestBody(request);

    const [originRequest, originResponse] = await logService.measureRequest(
      () => proxyRequest(request, requestBody)
    );

    const requestId = await logService.captureEvent(
      request,
      requestBody,
      originRequest,
      originResponse.clone()
    );

    return createResponse(originResponse, requestId);
  },
};

async function getRequestBody(request: Request): Promise<string | undefined> {
  try {
    return await request.text();
  } catch (e) {
    return;
  }
}
