import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import invariant from "tiny-invariant";
import { z } from "zod";
import {
  ErrorObjectSchema,
  GetProjectStatsSuccessResponseSchema,
} from "internal-logs";

const logsToken = process.env.API_AUTHENTICATION_TOKEN;
invariant(logsToken, "API_AUTHENTICATION_TOKEN is required");

const stats: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      response: {
        200: GetProjectStatsSuccessResponseSchema,
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

      try {
        const queryResult = await app.pg.pool.query(`
        SELECT project_id as "projectId", COUNT(*)::INTEGER as "total"
        FROM "Log"
        WHERE time > current_date - interval '7 days'
        GROUP BY project_id
        ORDER BY total DESC`);

        const result = {
          projects: queryResult.rows,
        };

        console.log(JSON.stringify(result));

        const parsed =
          await GetProjectStatsSuccessResponseSchema.safeParseAsync(result);

        if (!parsed.success) {
          reply.status(500).send({
            statusCode: 500,
            error: "Internal Server Error",
            message: `${parsed.error.message}`,
          });
          return;
        }

        return parsed.data;
      } catch (error) {
        console.error(error);
        reply.status(500).send({
          statusCode: 500,
          error: "Internal error",
          message: JSON.stringify(error),
        });
      }
    },
  });
};

export default stats;
