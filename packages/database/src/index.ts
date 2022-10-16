import { Prisma } from "@prisma/client";

export * from "./client";

export type { PrismaClient } from "./client";

//generic Prisma types
type JsonObject = Prisma.JsonObject;
export type { JsonObject };

//schema types

export type {
  User,
  AuthToken,
  Workspace,
  Project,
  HttpClient,
  HTTPMethod,
  HttpEndpoint,
  HttpRequestLog,
  ApiSchema,
  ApiSchemaExample,
  ApiSchemaParameterStyle,
  ApiSchemaSecurityOAuthFlowType,
  ApiSchemaSecurityScheme,
  ApiSchemaSecuritySchemeType,
  ApiSchemaServer,
  ApiSchemaModel,
  ApiSchemaOperation,
  ApiSchemaParameterLocation,
  ApiSchemaPath,
  ApiSchemaRequestBody,
  ApiSchemaResponseBody,
  ApiSchemaSecuritySchemeLocation,
  ApiSchemaTag,
  Integration,
} from "@prisma/client";
