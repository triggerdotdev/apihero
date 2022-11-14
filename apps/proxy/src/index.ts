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
          "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    const [originRequest, originResponse] = await logService.measureRequest(
      () => proxyRequest(request)
    );

    const requestId = await logService.captureEvent(
      request,
      originRequest,
      originResponse.clone()
    );

    return createResponse(originResponse, requestId);
  },
};
