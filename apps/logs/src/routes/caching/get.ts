import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import invariant from "tiny-invariant";
import { z } from "zod";
import {
  ErrorObjectSchema,
  GetCachedResponseItem,
  GetCachedSuccessResponseSchema,
} from "internal-logs";

const logsToken = process.env.API_AUTHENTICATION_TOKEN;
invariant(logsToken, "API_AUTHENTICATION_TOKEN is required");

const cached: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:projectId",
    schema: {
      params: z.object({
        projectId: z.string(),
      }),
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

      try {
        const queryResult = await app.pg.pool.query(
          `SELECT 
            base_url as "baseUrl", 
            is_cache_hit as "isCacheHit",
            COUNT(*) as "total", 
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gateway_duration) AS "medianTime", 
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY gateway_duration) AS "p95Time", 
            MIN(gateway_duration) as "minTime",
            MAX(gateway_duration) as "maxTime"  
          FROM "Log"
          WHERE "method" = 'GET' AND "project_id" = $1
          GROUP BY 
            base_url, 
            is_cache_hit`,
          [request.params.projectId]
        );

        const result: Record<string, GetCachedResponseItem> = {};
        queryResult.rows.forEach((row: any) => {
          const existingResult = result[row.baseUrl];
          if (existingResult) {
            if (row.isCacheHit) {
              existingResult.hitCount = row.total;
              existingResult.hitP50Time = row.medianTime;
              existingResult.hitP95Time = row.p95Time;
            } else {
              existingResult.missCount = row.total;
              existingResult.missP50Time = row.medianTime;
              existingResult.missP95Time = row.p95Time;
            }

            existingResult.total += row.total;
            existingResult.hitRate =
              existingResult.hitCount / existingResult.missCount;
          } else {
            const newResult: GetCachedResponseItem = {
              baseUrl: row.base_url,
              api: row.base_url.replace("https://").replace("http://"),
              hitRate: 0,
              total: row.total,
              hitCount: row.isCacheHit ? row.total : 0,
              missCount: row.isCacheHit ? 0 : row.total,
              hitP50Time: row.isCacheHit ? row.medianTime : 0,
              hitP95Time: row.isCacheHit ? row.p95Time : 0,
              missP50Time: row.isCacheHit ? 0 : row.medianTime,
              missP95Time: row.isCacheHit ? 0 : row.p95Time,
            };
            result[row.baseUrl] = newResult;
          }
        });

        console.log(result);

        //create an array of the results, sorted by hit rate
        const sortedResults = Object.values(result).sort(
          (a, b) => b.hitRate - a.hitRate
        );

        return {
          records: sortedResults,
        };
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

export default cached;
