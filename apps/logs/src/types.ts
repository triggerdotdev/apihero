import invariant from "tiny-invariant";
import { z } from "zod";

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

const dateSchema = z.preprocess((arg) => {
  if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
}, z.date());

const httpMethodSchema = z.union([
  z.literal("GET"),
  z.literal("POST"),
  z.literal("PUT"),
  z.literal("PATCH"),
  z.literal("DELETE"),
  z.literal("HEAD"),
  z.literal("OPTIONS"),
  z.literal("CONNECT"),
  z.literal("TRACE"),
]);

const httpHeaderSchema = z.record(z.string());

export const Log = z.object({
  id: z.string(),
  projectId: z.string(),
  method: httpMethodSchema,
  statusCode: z.number(),
  baseUrl: z.string(),
  path: z.string(),
  search: z.string(),
  requestHeaders: httpHeaderSchema,
  requestBody: jsonSchema.optional(),
  responseHeaders: httpHeaderSchema,
  responseBody: jsonSchema.optional(),
  isCacheHit: z.boolean(),
  responseSize: z.number(),
  requestDuration: z.number(),
  gatewayDuration: z.number(),
  createdAt: dateSchema,
});

export const CreateLogRequestBody = Log.omit({
  id: true,
  createdAt: true,
});

export const ErrorObject = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string().optional(),
});

export const models = {
  Log,
  CreateLogRequestBody,
};
