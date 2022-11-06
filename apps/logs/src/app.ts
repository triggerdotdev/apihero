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

  app.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });
}
