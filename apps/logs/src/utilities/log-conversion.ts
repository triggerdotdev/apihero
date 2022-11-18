import { z } from "zod";
import { Log, LogSchema } from "internal-logs";

const DatabaseLogSchema = z.object({
  id: LogSchema.shape.id,
  project_id: LogSchema.shape.projectId,
  request_id: LogSchema.shape.requestId,
  method: LogSchema.shape.method,
  status_code: LogSchema.shape.statusCode,
  base_url: LogSchema.shape.baseUrl,
  path: LogSchema.shape.path,
  search: LogSchema.shape.search,
  request_headers: LogSchema.shape.requestHeaders,
  request_body: LogSchema.shape.requestBody,
  response_headers: LogSchema.shape.responseHeaders,
  response_body: LogSchema.shape.responseBody,
  is_cache_hit: LogSchema.shape.isCacheHit,
  response_size: LogSchema.shape.responseSize,
  request_duration: LogSchema.shape.requestDuration,
  gateway_duration: LogSchema.shape.gatewayDuration,
  environment: LogSchema.shape.environment,
  time: z.date(),
});

function parseDatabaseLog(data: any) {
  return DatabaseLogSchema.safeParse(data);
}

export function databaseToLog(input: any): Log {
  const parseResult = parseDatabaseLog(input);

  if (!parseResult.success) {
    throw new Error(
      `Failed to parse database log: ${parseResult.error.message}`
    );
  }

  const databaseLog = parseResult.data;

  return {
    id: databaseLog.id,
    requestId: databaseLog.request_id,
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
    environment: databaseLog.environment,
    time: databaseLog.time.toISOString(),
  };
}
