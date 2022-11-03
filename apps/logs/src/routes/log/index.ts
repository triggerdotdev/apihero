import { FastifyPluginAsync } from "fastify";
import invariant from "tiny-invariant";
import { logSchema } from "../../types";

const logsToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
invariant(logsToken, "LOGS_API_AUTHENTICATION_TOKEN is required");

const log: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/", async function (request, reply) {
    if (request.headers.authorization !== `Bearer ${logsToken}`) {
      reply.status(401).send("Unauthorized");
      return;
    }

    const body = request.body;

    const result = await logSchema.safeParseAsync(body);

    if (!result.success) {
      const body = { errors: result.error.message };
      reply.status(400).send(body);
      return;
    }

    const client = await fastify.pg.query("SELECT NOW()");
    // console.log(client);

    return "this is the logs endpoint";
  });
};

export default log;
