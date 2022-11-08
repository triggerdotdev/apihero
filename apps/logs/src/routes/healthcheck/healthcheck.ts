import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Client } from "pg";
import { z } from "zod";
import { readDatabaseConnectionString } from "../../app";

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
        // if we can connect to the database and make a simple query
        const client = new Client({
          connectionString: readDatabaseConnectionString(),
        });

        await client.connect();
        await client.query("SELECT 1");

        reply.status(200).send("OK");
      } catch (error: unknown) {
        console.log("healthcheck ❌", { error });
        reply.status(500).send("ERROR");
      }
    },
  });
};

export default healthcheck;
