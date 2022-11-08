import cuid from "cuid";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import invariant from "tiny-invariant";
import { z } from "zod";
import { CreateLogRequestBodySchema, LogSchema } from "internal-logs";
import { ErrorObjectSchema } from "../../types";
import { databaseToLog } from "../../utilities/log-conversion";

const logsToken = process.env.API_AUTHENTICATION_TOKEN;
invariant(logsToken, "API_AUTHENTICATION_TOKEN is required");

const logs: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:projectId",
    schema: {
      params: z.object({
        projectId: z.string(),
      }),
      headers: z.object({
        authorization: z.string(),
      }),
      body: CreateLogRequestBodySchema,
      response: {
        200: z.object({
          success: z.literal(true),
          log: LogSchema,
        }),
        "4xx": ErrorObjectSchema,
        "5xx": ErrorObjectSchema,
      },
    },
    handler: async (request, reply) => {
      if (request.headers.authorization !== `Bearer ${logsToken}`) {
        reply.status(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "Incorrect authorization",
        });
        return;
      }

      if (
        request.params.projectId === undefined ||
        request.params.projectId === ""
      ) {
        reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "projectId is required",
        });
        return;
      }

      const id = cuid();
      const query = `INSERT INTO "Log" (id, request_id, project_id, method, status_code, base_url, path, search, request_headers, request_body, response_headers, response_body, is_cache_hit, response_size, request_duration, gateway_duration, time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`;

      const values = [
        id,
        request.body.requestId,
        request.params.projectId,
        request.body.method,
        request.body.statusCode,
        request.body.baseUrl,
        request.body.path,
        request.body.search,
        request.body.requestHeaders,
        request.body.requestBody,
        request.body.responseHeaders,
        request.body.responseBody,
        request.body.isCacheHit,
        request.body.responseSize,
        request.body.requestDuration,
        request.body.gatewayDuration,
        request.body.time,
      ];

      try {
        const queryResult = await app.pg.write.query(query, values);
        const log = databaseToLog(queryResult.rows[0]);
        reply.send({ success: true, log });
      } catch (error) {
        reply.status(500).send({
          statusCode: 500,
          error: "Internal error",
          message: JSON.stringify(error),
        });
      }
    },
  });
};

export default logs;
