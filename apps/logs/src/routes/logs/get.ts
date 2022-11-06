import cuid from "cuid";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Log, ErrorObject, GetLogsQuery } from "../../types";
import { databaseToLog } from "../../utilities/log-conversion";

const logsToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
invariant(logsToken, "LOGS_API_AUTHENTICATION_TOKEN is required");

const logs: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:projectId",
    schema: {
      params: z.object({
        projectId: z.string(),
      }),
      headers: z.object({
        authorization: z.string(),
      }),
      querystring: GetLogsQuery,
      response: {
        200: z.object({
          success: z.literal(true),
          logs: z.array(Log),
          results: z.number(),
          page: z.number(),
        }),
        "4xx": ErrorObject,
        "5xx": ErrorObject,
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

      let query = `SELECT * FROM "Log" WHERE project_id = $1`;
      const queryParams: (string | number | Date)[] = [
        request.params.projectId,
      ];

      if ("days" in request.query) {
        query += ` AND time >= NOW() - INTERVAL '1 days' * $2`;
        queryParams.push(request.query.days);
      } else {
        query += ` AND time >= $2 AND time <= $3`;
        queryParams.push(request.query.start);
        queryParams.push(request.query.end);
      }

      console.log(request.query);

      try {
        const queryResult = await app.pg.query(query, queryParams);
        reply.send({
          success: true,
          logs: queryResult.rows.map((l) => databaseToLog(l)),
          results: queryResult.rows.length,
          page: 1,
        });
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
