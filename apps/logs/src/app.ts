import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import invariant from "tiny-invariant";
import postgres from "@fastify/postgres";
import cuid from "cuid";
import { z } from "zod";
import { CreateLogRequestBody, ErrorObject, Log } from "./types";
import { databaseToLog } from "./utilities/log-conversion";
import sensible from "@fastify/sensible";
import { FastifyInstance } from "fastify";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { join } from "path";

const databaseUrl = process.env.LOGS_DATABASE_URL;
invariant(databaseUrl, "LOGS_DATABASE_URL is required");

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

export default async function (app: FastifyInstance, opts: AppOptions) {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(postgres, {
    connectionString: process.env.LOGS_DATABASE_URL,
  });

  app.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  const logsToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
  invariant(logsToken, "LOGS_API_AUTHENTICATION_TOKEN is required");

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/logs",
    schema: {
      headers: z.object({
        authorization: z.string(),
      }),
      body: CreateLogRequestBody,
      response: {
        200: z.object({
          success: z.literal(true),
          log: Log,
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
      }

      const id = cuid();
      const query = `INSERT INTO "Log" (id, project_id, method, status_code, base_url, path, search, request_headers, request_body, response_headers, response_body, is_cache_hit, response_size, request_duration, gateway_duration) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`;

      const values = [
        id,
        request.body.projectId,
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
      ];

      try {
        const queryResult = await app.pg.query(query, values);
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
}
