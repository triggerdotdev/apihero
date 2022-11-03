import { FastifyPluginAsync } from "fastify";
import invariant from "tiny-invariant";
import { createLogBodySchema } from "../../types";
import cuid = require("cuid");

const logsToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
invariant(logsToken, "LOGS_API_AUTHENTICATION_TOKEN is required");

const log: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/", async function (request, reply) {
    if (request.headers.authorization !== `Bearer ${logsToken}`) {
      reply.status(401).send("Unauthorized");
      return;
    }

    const body = request.body;

    const parseResult = await createLogBodySchema.safeParseAsync(body);

    if (!parseResult.success) {
      const body = { success: false, errors: parseResult.error.message };
      reply.status(400).send(body);
      return;
    }

    const id = cuid();
    const query = `INSERT INTO "Log" (id, project_id, method, status_code, base_url, path, search, request_headers, request_body, response_headers, response_body, is_cache_hit, response_size, request_duration, gateway_duration) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`;

    const values = [
      id,
      parseResult.data.projectId,
      parseResult.data.method,
      parseResult.data.statusCode,
      parseResult.data.baseUrl,
      parseResult.data.path,
      parseResult.data.search,
      parseResult.data.requestHeaders,
      parseResult.data.requestBody,
      parseResult.data.responseHeaders,
      parseResult.data.responseBody,
      parseResult.data.isCacheHit,
      parseResult.data.responseSize,
      parseResult.data.requestDuration,
      parseResult.data.gatewayDuration,
    ];

    try {
      const queryResult = await fastify.pg.query(query, values);
      console.log(queryResult);

      return { success: true, log: queryResult };
    } catch (error) {
      console.log(error);
      return { success: false, error: error };
    }
  });
};

export default log;
