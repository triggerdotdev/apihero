import { join } from "path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import fastify from "fastify";
import invariant from "tiny-invariant";
import postgres from "@fastify/postgres";
import { buildJsonSchemas, register } from "fastify-zod";
import { models } from "./types";

const databaseUrl = process.env.LOGS_DATABASE_URL;
invariant(databaseUrl, "LOGS_DATABASE_URL is required");

export const f = await register(fastify(), {
  jsonSchemas: buildJsonSchemas(models),
});

await f.register(postgres, {
  connectionString: process.env.LOGS_DATABASE_URL,
});

// This loads all plugins defined in plugins
// those should be support plugins that are reused
// through your application
await f.register(AutoLoad, {
  dir: join(__dirname, "plugins"),
});
