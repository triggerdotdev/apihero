import invariant from "tiny-invariant";
import * as cuid from "cuid";
import { databaseToLog } from "../../utilities/log-conversion";
import { f } from "../../app";

f.zod.post(
  "/logs",
  {
    operationId: "createLog",
    body: "CreateLogRequestBody",
    headers: "CreateLogRequestHeaders",
    reply: "CreateLogReply",
  },
  async ({ body }) => {
    const id = cuid.default();
    const query = `INSERT INTO "Log" (id, project_id, method, status_code, base_url, path, search, request_headers, request_body, response_headers, response_body, is_cache_hit, response_size, request_duration, gateway_duration) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`;

    const values = [
      id,
      body.projectId,
      body.method,
      body.statusCode,
      body.baseUrl,
      body.path,
      body.search,
      body.requestHeaders,
      body.requestBody,
      body.responseHeaders,
      body.responseBody,
      body.isCacheHit,
      body.responseSize,
      body.requestDuration,
      body.gatewayDuration,
    ];

    try {
      const queryResult = await f.pg.query(query, values);
      const log = databaseToLog(queryResult.rows[0]);
      return { success: true, log };
    } catch (error) {
      return { success: false, error: error };
    }
  }
);
