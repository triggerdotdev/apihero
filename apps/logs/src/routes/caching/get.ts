import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import invariant from "tiny-invariant";
import { z } from "zod";
import {
  ErrorObjectSchema,
  GetCachedResponseItem,
  GetCachedSuccessResponseSchema,
} from "internal-logs";
import { namedParameters } from "../../utilities/named-sql";

const logsToken = process.env.API_AUTHENTICATION_TOKEN;
invariant(logsToken, "API_AUTHENTICATION_TOKEN is required");

const rowSchema = z.object({
  baseUrl: z.string(),
  isCacheHit: z.boolean(),
  total: z.preprocess((value) => parseInt(value as string), z.number()),
  medianTime: z.number(),
  p95Time: z.number(),
  minTime: z.number(),
  maxTime: z.number(),
});

const cached: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:projectId",
    schema: {
      params: z.object({
        projectId: z.string(),
      }),
      querystring: z
        .union([
          z.object({
            days: z.preprocess(
              (arg) => arg !== undefined && parseInt(arg as string),
              z.number()
            ),
          }),
          z.object({
            start: z.string(),
            end: z.string(),
          }),
        ])
        .default({ days: 7 }),
      response: {
        200: GetCachedSuccessResponseSchema,
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

      const queryParams: Record<string, string | number | boolean> = {
        projectId: request.params.projectId,
      };

      let query = `SELECT 
        base_url as "baseUrl", 
        is_cache_hit as "isCacheHit",
        COUNT(*) as "total", 
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gateway_duration) AS "medianTime", 
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY gateway_duration) AS "p95Time", 
        MIN(gateway_duration) as "minTime",
        MAX(gateway_duration) as "maxTime"  
      FROM "Log"
      WHERE "method" = 'GET' AND "project_id" = :projectId`;

      //date range
      if ("days" in request.query) {
        query += ` AND time >= NOW() - INTERVAL '1 days' * :days`;
        queryParams.days = request.query.days;
      } else {
        query += ` AND time >= :start AND time <= :end`;
        queryParams.start = request.query.start;
        queryParams.end = request.query.end;
      }

      //group by
      query += ` GROUP BY base_url, is_cache_hit`;

      try {
        const namedQuery = namedParameters(query, queryParams);
        const queryResult = await app.pg.pool.query(namedQuery);

        let result: Record<string, GetCachedResponseItem> = {};
        queryResult.rows.forEach((row: any) => {
          const parsedRow = rowSchema.parse(row);

          const existingResult = result[parsedRow.baseUrl];
          if (existingResult !== undefined) {
            if (parsedRow.isCacheHit) {
              existingResult.hitCount = parsedRow.total;
              existingResult.hitP50Time = parsedRow.medianTime;
              existingResult.hitP95Time = parsedRow.p95Time;
            } else {
              existingResult.missCount = parsedRow.total;
              existingResult.missP50Time = parsedRow.medianTime;
              existingResult.missP95Time = parsedRow.p95Time;
            }

            existingResult.total += parsedRow.total;
            existingResult.hitRate =
              existingResult.hitCount / existingResult.total;
          } else {
            const newResult: GetCachedResponseItem = {
              baseUrl: parsedRow.baseUrl,
              api: parsedRow.baseUrl
                .replace("https://", "")
                .replace("http://", ""),
              hitRate: parsedRow.isCacheHit ? 1 : 0,
              total: parsedRow.total,
              hitCount: parsedRow.isCacheHit ? parsedRow.total : 0,
              missCount: parsedRow.isCacheHit ? 0 : parsedRow.total,
              hitP50Time: parsedRow.isCacheHit ? parsedRow.medianTime : 0,
              hitP95Time: parsedRow.isCacheHit ? parsedRow.p95Time : 0,
              missP50Time: parsedRow.isCacheHit ? 0 : parsedRow.medianTime,
              missP95Time: parsedRow.isCacheHit ? 0 : parsedRow.p95Time,
            };
            result[row.baseUrl] = newResult;
          }
        });

        //create an array of the results, sorted by hit rate
        const sortedResults = Object.values(result).sort(
          (a, b) => b.hitRate - a.hitRate
        );

        return {
          records: sortedResults,
        };
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

export default cached;
