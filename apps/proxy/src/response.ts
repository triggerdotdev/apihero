import { REQUEST_ID_HEADER_NAME } from "@apihero/constants-js";

export function createResponse(
  originResponse: Response,
  requestId?: string
): Response {
  const responseClone = originResponse.clone();

  const headers = Object.fromEntries(responseClone.headers);
  const strippedResponseHeaders = stripResponseHeaders(headers);

  return new Response(responseClone.body, {
    status: responseClone.status,
    statusText: responseClone.statusText,
    headers: requestId
      ? {
          ...strippedResponseHeaders,
          [REQUEST_ID_HEADER_NAME]: requestId,
        }
      : strippedResponseHeaders,
  });
}

function stripResponseHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === "connection") continue;
    if (key.toLowerCase() === "content-encoding") continue;
    if (key.toLowerCase() === "content-security-policy") continue;
    if (key.toLowerCase() === "date") continue;
    if (key.toLowerCase() === "server") continue;
    if (key.toLowerCase() === "strict-transport-security") continue;
    if (key.toLowerCase() === "transfer-encoding") continue;
    if (key.toLowerCase() === "content-length") continue;

    // FIXME: For some reason, including this location header causes the response to be empty
    if (key.toLowerCase() === "location") continue;

    result[key] = value;
  }

  return result;
}
