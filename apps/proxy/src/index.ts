import { LogService } from "./logger";
import { proxyRequest } from "./proxy";
import { createResponse } from "./response";

export default {
  async fetch(
    request: Request,
    env: Bindings,
    context: ExecutionContext
  ): Promise<Response> {
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
      originResponse
    );

    return createResponse(originResponse, requestId);
  },
};
