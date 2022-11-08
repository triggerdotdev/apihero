import { z } from "zod";
import { LogSchema } from "internal-logs";

export const ErrorObjectSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string().optional(),
});

export type ErrorObject = z.infer<typeof ErrorObjectSchema>;

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
