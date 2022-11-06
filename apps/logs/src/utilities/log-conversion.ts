import { z } from "zod";
import { Log } from "../types";

const DatabaseLogSchema = z.object({
  id: Log.shape.id,
  project_id: Log.shape.projectId,
  method: Log.shape.method,
  status_code: Log.shape.statusCode,
  base_url: Log.shape.baseUrl,
  path: Log.shape.path,
  search: Log.shape.search,
  request_headers: Log.shape.requestHeaders,
  request_body: Log.shape.requestBody,
  response_headers: Log.shape.responseHeaders,
  response_body: Log.shape.responseBody,
  is_cache_hit: Log.shape.isCacheHit,
  response_size: Log.shape.responseSize,
  request_duration: Log.shape.requestDuration,
  gateway_duration: Log.shape.gatewayDuration,
  time: Log.shape.time,
});

function parseDatabaseLog(data: any) {
  return DatabaseLogSchema.safeParse(data);
}

export function databaseToLog(input: any): z.infer<typeof Log> {
  const parseResult = parseDatabaseLog(input);

  if (!parseResult.success) {
    throw new Error(
      `Failed to parse database log: ${parseResult.error.message}`
    );
  }

  const databaseLog = parseResult.data;

  return {
    id: databaseLog.id,
    projectId: databaseLog.project_id,
    method: databaseLog.method,
    statusCode: databaseLog.status_code,
    baseUrl: databaseLog.base_url,
    path: databaseLog.path,
    search: databaseLog.search,
    requestHeaders: databaseLog.request_headers,
    requestBody: databaseLog.request_body,
    responseHeaders: databaseLog.response_headers,
    responseBody: databaseLog.response_body,
    isCacheHit: databaseLog.is_cache_hit,
    responseSize: databaseLog.response_size,
    requestDuration: databaseLog.request_duration,
    gatewayDuration: databaseLog.gateway_duration,
    time: databaseLog.time,
  };
}
