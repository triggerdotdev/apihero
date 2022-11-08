import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import invariant from "tiny-invariant";
import postgres from "@fastify/postgres";
import { FastifyInstance } from "fastify";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { join } from "path";

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

export default async function (app: FastifyInstance, opts: AppOptions) {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(postgres, {
    name: "read",
    connectionString: readDatabaseConnectionString(),
  });

  app.register(postgres, {
    name: "write",
    connectionString: writeDatabaseConnectionString(),
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

export function readDatabaseConnectionString(): string {
  invariant(process.env.DATABASE_URL, "DATABASE_URL is required");
  return process.env.DATABASE_URL;
}

export function writeDatabaseConnectionString(): string {
  invariant(process.env.DATABASE_URL, "DATABASE_URL is required");
  const databaseUrl = new URL(process.env.DATABASE_URL);

  const isLocalHost = databaseUrl.hostname === "localhost";

  const PRIMARY_REGION = isLocalHost ? null : process.env.PRIMARY_REGION;
  const FLY_REGION = isLocalHost ? null : process.env.FLY_REGION;

  const isReadReplicaRegion = !PRIMARY_REGION || PRIMARY_REGION === FLY_REGION;

  if (!isLocalHost) {
    databaseUrl.host = `${FLY_REGION}.${databaseUrl.host}`;
    if (!isReadReplicaRegion) {
      // 5433 is the read-replica port
      databaseUrl.port = "5433";
    }
  }

  return databaseUrl.toString();
}
