import type { ZodType } from "zod";
import { z } from "zod";

export type Gateway = {
  readonly gatewayUrl: string;
  readonly projectId: string;
};

export type ClientConfig = {
  baseUrl: string;
  authorization?: Authorization;
  cacheTtl?: number;
};

export type APIHeroEndpointMetadata = {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  config: EndpointConfig;
  schema?: ProcedureParserZodEsque<any, any>;
  client: {
    name: string;
    config: ClientConfig;
    gateway: Gateway;
  };
};

const BasicAuthorizationSchema = z.object({
  type: z.literal("basic"),
  usernameKey: z.string(),
  passwordKey: z.string(),
});

//this will become a discrimated union when we have more than one
const AuthorizationSchema = BasicAuthorizationSchema;
export type Authorization = z.infer<typeof AuthorizationSchema>;

export type Client = {
  readonly name: string;
  readonly config: ClientConfig;
  readonly gateway: Gateway;
};

const RequestValueSchema = z.union([z.string(), z.number(), z.boolean()]);
const RequestRecordsSchema = z.record(RequestValueSchema);
export type RequestRecordValue = z.infer<typeof RequestValueSchema>;
export type RequestRecords = z.infer<typeof RequestRecordsSchema>;

const EndpointConfigSchema = z.object({
  query: RequestRecordsSchema.optional(),
  headers: RequestRecordsSchema.optional(),
  timeout: z.number().optional(),
});

export type EndpointConfig = z.infer<typeof EndpointConfigSchema>;

export type HTTPResponse<T> = {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  body(): T;
  //todo update this with an optional strong type
  errorBody(): any;
};

export type ProcedureParserZodEsque<TInput, TOutput> = ZodType<
  TOutput,
  any,
  TInput
>;

const MethodSchema = z.union([
  z.literal("GET"),
  z.literal("HEAD"),
  z.literal("POST"),
  z.literal("PUT"),
  z.literal("PATCH"),
  z.literal("OPTIONS"),
  z.literal("DELETE"),
]);
export type HTTPMethod = z.infer<typeof MethodSchema>;

export const GatewayRequestBodySchema = z.object({
  props: RequestRecordsSchema,
});

export type GatewayRequestBody = z.infer<typeof GatewayRequestBodySchema>;

export const GatewayResponseBodyErrorSchema = z.object({
  type: z.union([
    z.literal("MISSING_VARIABLE"),
    z.literal("REQUEST_BODY_PARSE_FAILED"),
    z.literal("REQUEST_BODY_INVALID_JSON"),
    z.literal("RESPONSE_BODY_PARSE_FAILED"),
    z.literal("INTERNAL_METHOD_NOT_ALLOWED"),
    z.literal("CLIENT_NOT_FOUND"),
    z.literal("ENDPOINT_NOT_FOUND"),
    z.literal("MISSING_PROJECT_CONSTANT"),
  ]),
  message: z.union([z.string(), z.any()]),
});

const GatewayResponseBodySuccessSchema = z.object({
  hasError: z.literal(false),
  response: z.object({
    headers: z.record(z.string()),
    ok: z.boolean(),
    redirected: z.boolean(),
    status: z.number(),
    statusText: z.string(),
    type: z.union([
      z.literal("basic"),
      z.literal("cors"),
      z.literal("default"),
      z.literal("error"),
      z.literal("opaque"),
      z.literal("opaqueredirect"),
    ]),
    url: z.string(),
    body: z.any(),
  }),
});

export const GatewayResponseBodySchema = z.discriminatedUnion("hasError", [
  z.object({
    hasError: z.literal(true),
    error: GatewayResponseBodyErrorSchema,
  }),
  GatewayResponseBodySuccessSchema,
]);

export type GatewayResponseBody = z.infer<typeof GatewayResponseBodySchema>;
export type GatewayResponseBodyError = z.infer<
  typeof GatewayResponseBodyErrorSchema
>;

export type LoggedRequest = {
  readonly method: HTTPMethod;
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly body?: any;
};

export type LoggedResponse = {
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type:
    | "error"
    | "basic"
    | "cors"
    | "default"
    | "opaque"
    | "opaqueredirect";
  readonly url: string;
  readonly body?: any;
  readonly transformedBody?: any;
  readonly headers: Record<string, string>;
};
