import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const healthcheck: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      headers: z.object({
        host: z.string().optional(),
      }),
    },
    handler: async (request, reply) => {
      const host = request.headers["X-Forwarded-Host"] ?? request.headers.host;

      try {
        await app.pg.pool.query("SELECT 1");
        reply.status(200).send("OK");
      } catch (error: unknown) {
        console.log("healthcheck ❌", { error });
        reply.status(500).send("ERROR");
      }
    },
  });
};

export default healthcheck;
