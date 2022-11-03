import { FastifyPluginAsync } from "fastify";

const log: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const client = await fastify.pg.query("SELECT NOW()");
    console.log(client);

    return "this is the logs endpoint";
  });
};

export default log;
