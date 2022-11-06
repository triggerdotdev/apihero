// import cuid from "cuid";
// import { databaseToLog } from "../../utilities/log-conversion";
// import invariant from "tiny-invariant";
// import { app } from "../../app";
// import { ZodTypeProvider } from "fastify-type-provider-zod";
// import { CreateLogRequestBody, Log } from "../../types";
// import { z } from "zod";

// const logsToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
// invariant(logsToken, "LOGS_API_AUTHENTICATION_TOKEN is required");

// app.withTypeProvider<ZodTypeProvider>().route({
//   method: "POST",
//   url: "/logs",
//   // Define your schema
//   schema: {
//     headers: z.object({
//       authorization: z.string(),
//     }),
//     body: CreateLogRequestBody,
//     response: {
//       200: z.object({
//         success: z.literal(true),
//         log: Log,
//       }),
//       "4xx": z.object({
//         success: z.literal(false),
//         error: z.any(),
//       }),
//       "5xx": z.object({
//         success: z.literal(false),
//         error: z.any(),
//       }),
//     },
//   },
//   handler: async (request, reply) => {
//     if (request.headers.authorization !== `Bearer ${logsToken}`) {
//       throw app.httpErrors.unauthorized();
//     }

//     const id = cuid();
//     const query = `INSERT INTO "Log" (id, project_id, method, status_code, base_url, path, search, request_headers, request_body, response_headers, response_body, is_cache_hit, response_size, request_duration, gateway_duration) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`;

//     const values = [
//       id,
//       request.body.projectId,
//       request.body.method,
//       request.body.statusCode,
//       request.body.baseUrl,
//       request.body.path,
//       request.body.search,
//       request.body.requestHeaders,
//       request.body.requestBody,
//       request.body.responseHeaders,
//       request.body.responseBody,
//       request.body.isCacheHit,
//       request.body.responseSize,
//       request.body.requestDuration,
//       request.body.gatewayDuration,
//     ];

//     try {
//       const queryResult = await app.pg.query(query, values);
//       const log = databaseToLog(queryResult.rows[0]);
//       reply.send({ success: true, log });
//     } catch (error) {
//       reply.send({ success: false, error: error });
//     }
//   },
// });
