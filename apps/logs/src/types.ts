import invariant from "tiny-invariant";
import { z } from "zod";

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

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
  time: z.string(),
});

export const CreateLogRequestBody = Log.omit({
  id: true,
  projectId: true,
});

export const ErrorObject = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string().optional(),
});

export const GetLogsQuery = z
  .union([
    z.object({
      start: z.string(),
      end: z.string(),
    }),
    z.object({
      days: z.preprocess(
        (arg) => arg !== undefined && parseInt(arg as string),
        z.number()
      ),
    }),
  ])
  .optional()
  .default({ days: 7 })
  .and(
    z.object({
      api: z.string().optional(),
      path: z.string().optional(),
      status: z
        .preprocess(
          (arg) =>
            arg !== undefined &&
            typeof arg === "string" &&
            arg.split(",").map((s) => s.trim()),
          z.array(z.string())
        )
        .optional(),
      cached: z
        .preprocess((arg) => arg !== undefined && arg === "true", z.boolean())
        .optional(),
      page: z
        .preprocess(
          (arg) => arg !== undefined && parseInt(arg as string),
          z.number()
        )
        .optional()
        .default(1),
    })
  );

export const GetLogsSuccessResponse = z.object({
  logs: z.array(Log),
  page: z.number(),
  next: z.string().optional(),
  previous: z.string().optional(),
});
