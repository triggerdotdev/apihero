import cuid from "cuid";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import invariant from "tiny-invariant";
import { z } from "zod";
import { CreateLogRequestBody, Log, ErrorObject } from "../../types";
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
      querystring: z.object({}),
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

      const query = `SELECT * FROM "Log" WHERE project_id = $1`;

      try {
        const queryResult = await app.pg.query(query, [
          request.params.projectId,
        ]);
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
