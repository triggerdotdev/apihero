import { FastifyPluginAsync } from "fastify";
import invariant from "tiny-invariant";

const logsToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
invariant(logsToken, "LOGS_API_AUTHENTICATION_TOKEN is required");

const log: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/", async function (request, reply) {
    if (request.headers.authorization !== `Bearer ${logsToken}`) {
      reply.status(401).send("Unauthorized");
      return;
    }

    const client = await fastify.pg.query("SELECT NOW()");
    // console.log(client);

    return "this is the logs endpoint";
  });
};

export default log;
