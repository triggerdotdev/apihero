import { z } from "zod";

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

export const HttpMethodSchema = z.union([
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

export type HttpMethod = z.infer<typeof HttpMethodSchema>;

export const HttpHeaderSchema = z.record(z.string());

export type HttpHeader = z.infer<typeof HttpHeaderSchema>;

export const LogSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  projectId: z.string(),
  method: HttpMethodSchema,
  statusCode: z.number(),
  baseUrl: z.string(),
  path: z.string(),
  search: z.string(),
  requestHeaders: HttpHeaderSchema,
  requestBody: jsonSchema.optional(),
  responseHeaders: HttpHeaderSchema,
  responseBody: jsonSchema.optional(),
  isCacheHit: z.boolean(),
  responseSize: z.number(),
  requestDuration: z.number(),
  gatewayDuration: z.number(),
  time: z.string(),
  environment: z.string(),
});

export type Log = z.infer<typeof LogSchema>;

export const CreateLogRequestBodySchema = LogSchema.omit({
  id: true,
  projectId: true,
});

export type CreateLogRequestBody = z.infer<typeof CreateLogRequestBodySchema>;

export const ErrorObjectSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string().optional(),
});

export const GetLogsQuerySchema = z
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

export type GetLogsQuery = z.infer<typeof GetLogsQuerySchema>;

export const GetLogsSuccessResponseSchema = z.object({
  logs: z.array(LogSchema),
  page: z.number(),
  next: z.string().optional(),
  previous: z.string().optional(),
});

export type GetLogsSuccessResponse = z.infer<
  typeof GetLogsSuccessResponseSchema
>;

export const GetLogsResponseSchema = z.union([
  ErrorObjectSchema,
  GetLogsSuccessResponseSchema,
]);
