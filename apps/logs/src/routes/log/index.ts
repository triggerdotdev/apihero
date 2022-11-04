import cuid from "cuid";
import { databaseToLog } from "../../utilities/log-conversion";
import { FastifyPluginAsync } from "fastify";
import invariant from "tiny-invariant";

const logsToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
invariant(logsToken, "LOGS_API_AUTHENTICATION_TOKEN is required");

const log: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.zod.post(
    "/",
    {
      operationId: "createLog",
      body: "CreateLogRequestBody",
      // headers: "CreateLogRequestHeaders",
      reply: "CreateLogReply",
    },
    async ({ body, headers }) => {
      if (headers.authorization !== `Bearer ${logsToken}`) {
        throw fastify.httpErrors.unauthorized();
      }

      const id = cuid();
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
        const queryResult = await fastify.pg.query(query, values);
        const log = databaseToLog(queryResult.rows[0]);
        return { success: true, log };
      } catch (error) {
        return { success: false, error: error };
      }
    }
  );
};

export default log;
