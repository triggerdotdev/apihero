import { z } from "zod";

export const HTTPResponseStatusSchema = z.object({
  status: z.number(),
  duration: z.number().optional(),
  size: z.number().optional(),
});
export type HTTPResponseStatus = z.infer<typeof HTTPResponseStatusSchema>;

export const HTTPHeadersSchema = z.record(z.string(), z.string());
export type HTTPHeaders = z.infer<typeof HTTPHeadersSchema>;

export const HTTPResponseSchema = z.object({
  status: z.number(),
  duration: z.number().optional(),
  size: z.number().optional(),
  headers: HTTPHeadersSchema.optional(),
  body: z.any().optional(),
});

export type HTTPResponse = z.infer<typeof HTTPResponseSchema>;
