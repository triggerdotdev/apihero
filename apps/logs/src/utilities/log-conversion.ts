import { z } from "zod";
import { Log, logSchema } from "../types";

const DatabaseLogSchema = z.object({
  id: logSchema.shape.id,
  project_id: logSchema.shape.projectId,
  method: logSchema.shape.method,
  status_code: logSchema.shape.statusCode,
  base_url: logSchema.shape.baseUrl,
  path: logSchema.shape.path,
  search: logSchema.shape.search,
  request_headers: logSchema.shape.requestHeaders,
  request_body: logSchema.shape.requestBody,
  response_headers: logSchema.shape.responseHeaders,
  response_body: logSchema.shape.responseBody,
  is_cache_hit: logSchema.shape.isCacheHit,
  response_size: logSchema.shape.responseSize,
  request_duration: logSchema.shape.requestDuration,
  gateway_duration: logSchema.shape.gatewayDuration,
  created_at: logSchema.shape.createdAt,
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
    createdAt: databaseLog.created_at,
  };
}
