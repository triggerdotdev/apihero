import type { FastifyZod } from "fastify-zod";
import { models } from "../types";

declare module "fastify" {
  export interface FastifyInstance {
    readonly zod: FastifyZod<typeof models>;
  }
}
