import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { z } from "zod";
import type { HTTPMethod } from "~/libraries/client";
import { createRequestLog } from "~/models/requestLog.server";

const logSchema = z.object({
  id: z.string(),
  method: z.string(),
  statusCode: z.number(),
  baseUrl: z.string(),
  path: z.string(),
  search: z.string(),
  isCacheHit: z.boolean(),
  operationId: z.string(),
  integrationSlug: z.string(),
  projectKey: z.string(),
  version: z.string(),
  clientAuthentication: z.any(),
  requestBody: z.any(),
  requestHeaders: z.record(z.string()),
  responseBody: z.any(),
  responseHeaders: z.record(z.string()),
  responseSize: z.number(),
  params: z.record(z.any()),
  mappings: z.array(z.any()).optional(),
  requestDuration: z.number(),
  gatewayDuration: z.number(),
});

export const loader: LoaderFunction = async ({ request }) => {
  return json({}, { status: 405 });
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({}, { status: 405 });
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader === null) {
    return false;
  }
  const [type, key] = authHeader.split(" ");
  if (type !== "Bearer") {
    return false;
  }

  if (key !== process.env.GATEWAY_API_PRIVATE_KEY) {
    return json({}, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = logSchema.safeParse(body);

    if (!result.success) {
      console.error("Log parse error", result.error.message);
      return json({ error: result.error.message }, { status: 400 });
    }

    await createRequestLog({
      id: result.data.id,
      method: result.data.method as HTTPMethod,
      statusCode: result.data.statusCode,
      baseUrl: result.data.baseUrl,
      path: result.data.path,
      isCacheHit: result.data.isCacheHit,
      integrationSlug: result.data.integrationSlug,
      operationId: result.data.operationId,
      projectKey: result.data.projectKey,
      clientAuthenticationId: result.data.clientAuthentication?.id,
      search: result.data.search,
      requestBody: result.data.requestBody,
      requestHeaders: result.data.requestHeaders,
      responseBody: result.data.responseBody,
      responseHeaders: result.data.responseHeaders,
      responseSize: result.data.responseSize,
      params: result.data.params,
      mappings: result.data.mappings,
      requestDuration: result.data.requestDuration,
      gatewayDuration: result.data.gatewayDuration,
    });

    return json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return json(
      { error: "invalid json", details: JSON.stringify(error) },
      { status: 400 }
    );
  }
};
