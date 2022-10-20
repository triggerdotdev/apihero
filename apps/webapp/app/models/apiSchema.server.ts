import type {
  ApiSchema,
  ApiSchemaExample,
  ApiSchemaParameterStyle,
  ApiSchemaSecurityOAuthFlowType,
  ApiSchemaSecurityScheme,
  ApiSchemaSecuritySchemeType,
  ApiSchemaServer,
  Prisma,
} from ".prisma/client";
import type { OpenAPIV3_1 } from "openapi-types";
import { z } from "zod";
import { prisma } from "~/db.server";
import type { ApiHeroExtensions } from "./integration.server";

export { ApiSchema };

export async function allSchemas() {
  return prisma.apiSchema.findMany({
    include: {
      integration: true,
    },
  });
}

export async function findSchemaById(id: ApiSchema["id"]) {
  return prisma.apiSchema.findFirst({
    where: {
      id,
    },
    include: {
      integration: true,
      servers: {
        where: {
          operationId: null,
        },
      },
    },
  });
}

export const OperationsParamsSchema = z.object({
  search: z
    .object({
      tag: z.object({ name: z.string() }).optional(),
    })
    .optional(),
});

export type OperationsParams = z.infer<typeof OperationsParamsSchema>;

export async function findOperationsBySchemaId(
  schemaId: string,
  params: OperationsParams
) {
  return prisma.apiSchemaOperation.findMany({
    orderBy: {
      sortIndex: "asc",
    },
    where: {
      schemaId,
      tags: params.search?.tag
        ? {
            some: {
              name: params.search.tag.name,
            },
          }
        : undefined,
    },
    include: {
      path: true,
      tags: true,
      requestBody: {
        include: {
          contents: true,
        },
      },
      responseBodies: {
        include: {
          contents: true,
        },
      },
      securityRequirements: {
        include: {
          securityScheme: true,
        },
      },
      parameters: true,
    },
  });
}

export async function findTagsBySchemaId(schemaId: string) {
  return prisma.apiSchemaTag.findMany({
    where: {
      schemaId,
    },
    orderBy: {
      operations: {
        _count: "desc",
      },
    },
    include: {
      _count: {
        select: { operations: true },
      },
    },
  });
}

export async function findModelsBySchemaId(schemaId: string) {
  return prisma.apiSchemaModel.findMany({
    where: {
      schemaId,
    },
  });
}

export async function findModelById(modelId: string) {
  return prisma.apiSchemaModel.findFirst({
    where: {
      id: modelId,
    },
  });
}

export async function findOperationsBySchemaIdForBulkOperations(
  schemaId: string
) {
  return prisma.apiSchemaOperation.findMany({
    orderBy: {
      sortIndex: "asc",
    },
    where: {
      schemaId,
    },
    include: {
      path: true,
      tags: true,
      securityRequirements: {
        include: {
          scopes: true,
        },
      },
    },
  });
}

export async function findOperationById(id: string) {
  return prisma.apiSchemaOperation.findFirst({
    where: {
      id,
    },
    include: {
      schema: {
        include: {
          models: true,
        },
      },
      path: true,
      tags: true,
      requestBody: {
        include: {
          contents: true,
        },
      },
      responseBodies: {
        include: {
          contents: true,
        },
        orderBy: {
          statusCode: "asc",
        },
      },
      securityRequirements: {
        include: {
          securityScheme: true,
        },
      },
      parameters: true,
    },
  });
}

export async function findSecuritySchemesBySchemeId(schemaId: string) {
  return prisma.apiSchemaSecurityScheme.findMany({
    where: {
      schemaId,
    },
    include: {
      securityRequirements: {
        select: {
          _count: true,
        },
      },
      oauthFlows: {
        include: {
          scopes: true,
        },
      },
    },
  });
}

export async function bulkEditSecurityRequirements(
  schemaId: string,
  operations: Awaited<
    ReturnType<typeof findOperationsBySchemaIdForBulkOperations>
  >,
  securitySchemeId: string,
  operationIds: string[],
  operationScopes: {
    [operationId: string]: { scopes: string[]; requireAll: boolean };
  }
) {
  await prisma.$transaction(async (prisma) => {
    for (const operation of operations) {
      if (operationIds.includes(operation.id)) {
        // Delete the existing security requirements for this operation, and then recreate them
        await prisma.apiSchemaSecurityRequirement.deleteMany({
          where: {
            operationId: operation.id,
            securitySchemeId,
          },
        });

        if (!operationScopes[operation.id]) {
          await prisma.apiSchemaSecurityRequirement.create({
            data: {
              securitySchemeId,
              operationId: operation.id,
            },
          });
        } else {
          const { scopes, requireAll } = operationScopes[operation.id];

          if (requireAll) {
            await prisma.apiSchemaSecurityRequirement.create({
              data: {
                securitySchemeId,
                operationId: operation.id,
                scopes: {
                  connect: scopes
                    ? scopes.map((scope) => ({
                        id: scope,
                      }))
                    : undefined,
                },
              },
            });
          } else {
            for (const scope of scopes) {
              await prisma.apiSchemaSecurityRequirement.create({
                data: {
                  securitySchemeId,
                  operationId: operation.id,
                  scopes: {
                    connect: {
                      id: scope,
                    },
                  },
                },
              });
            }
          }
        }
      } else {
        const existingSecurityRequirements =
          operation.securityRequirements.filter(
            (sr) => sr.securitySchemeId === securitySchemeId
          );

        // If this operation is not "checked", and they currently have security requirements with this security scheme,
        // then we remove them
        if (existingSecurityRequirements.length > 0) {
          await prisma.apiSchemaSecurityRequirement.deleteMany({
            where: {
              id: { in: existingSecurityRequirements.map((sr) => sr.id) },
            },
          });
        }
      }
    }
  });

  const newDocument = await generateSpecFromSchema(schemaId);

  if (newDocument) {
    await prisma.apiSchemaChange.create({
      data: {
        rawData: newDocument as any,
        schemaId: schemaId,
      },
    });
  }
}

export async function bulkEditOperationAuthRequirement(
  schemaId: string,
  operations: Awaited<ReturnType<typeof findOperationsBySchemaId>>,
  requiredIds: string[]
) {
  await prisma.$transaction(async (prisma) => {
    for (const operation of operations) {
      if (requiredIds.includes(operation.id) === operation.securityOptional) {
        await prisma.apiSchemaOperation.update({
          where: {
            id: operation.id,
          },
          data: {
            securityOptional: !requiredIds.includes(operation.id),
          },
        });
      }
    }
  });

  const newDocument = await generateSpecFromSchema(schemaId);

  if (newDocument) {
    await prisma.apiSchemaChange.create({
      data: {
        rawData: newDocument as any,
        schemaId: schemaId,
      },
    });
  }
}

export async function findSecuritySchemeById(id: string) {
  return prisma.apiSchemaSecurityScheme.findFirst({
    where: {
      id,
    },
    include: {
      securityRequirements: {
        include: {
          schema: true,
          operation: true,
        },
      },
      oauthFlows: {
        include: {
          scopes: true,
        },
      },
      scopes: true,
    },
  });
}

export async function updateSecuritySchemeById(
  id: string,
  updates: Pick<
    ApiSchemaSecurityScheme,
    "title" | "summary" | "isEnabled" | "description"
  >
) {
  return prisma.apiSchemaSecurityScheme.update({
    where: { id },
    data: updates,
  });
}

export async function generateSpecFromSchema(
  schemaId: string
): Promise<OpenAPIV3_1.Document | undefined> {
  const schema = await findSchemaWithKitchenSink(schemaId);

  if (!schema) {
    return;
  }

  return generateSpec(schema);
}

export async function getSchemaIdFromOperationId(operationId: string) {
  const operation = await prisma.apiSchemaOperation.findFirst({
    where: {
      id: operationId,
    },
    include: {
      schema: true,
    },
  });

  if (!operation) {
    return;
  }

  return operation.schema.id;
}

export async function generateSpecFromSchemaScopedToOperation(
  schemaId: string,
  operationId: string
): Promise<OpenAPIV3_1.Document | undefined> {
  const schema = await findSchemaWithKitchenSink(schemaId);

  if (!schema) {
    console.log(`Couldn't find schema ${schemaId}`);
    return;
  }

  const operation = await findOperationById(operationId);

  if (!operation) {
    console.log(`Couldn't find operation ${operationId}`);
    return;
  }

  return generateSpecScopedToOperation(schema, operation);
}

async function findSchemaWithKitchenSink(schemaId: string) {
  return prisma.apiSchema.findFirst({
    where: {
      id: schemaId,
    },
    include: {
      tags: true,
      servers: true,
      securityRequirements: {
        include: {
          securityScheme: true,
          scopes: true,
        },
      },
      securitySchemes: {
        include: {
          scopes: true,
          oauthFlows: {
            include: {
              scopes: true,
            },
          },
        },
      },
      models: true,
      paths: {
        orderBy: {
          sortIndex: "asc",
        },
        include: {
          servers: true,
          parameters: {
            include: {
              examples: true,
            },
          },
          operations: {
            orderBy: {
              sortIndex: "asc",
            },
            include: {
              tags: true,
              servers: true,
              securityRequirements: {
                include: {
                  scopes: true,
                  securityScheme: true,
                },
              },
              parameters: {
                include: {
                  examples: true,
                },
              },
              requestBody: {
                include: {
                  contents: {
                    include: {
                      examples: true,
                    },
                  },
                },
              },
              responseBodies: {
                include: {
                  contents: {
                    include: {
                      examples: true,
                    },
                  },
                  headers: {
                    include: {
                      examples: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

type GenerateSpecSchemaType = NonNullable<
  Awaited<ReturnType<typeof findSchemaWithKitchenSink>>
>;

function generateSpec(schema: GenerateSpecSchemaType): OpenAPIV3_1.Document {
  const originalSpec = schema.rawData as unknown as OpenAPIV3_1.Document;

  const spec: DeepPartial<OpenAPIV3_1.Document> = {};

  spec.openapi = "3.1.0";
  spec.jsonSchemaDialect = schema.jsonSchemaDialect ?? undefined;
  spec.info = {
    title: schema.title,
    contact: originalSpec.info.contact,
    license: originalSpec.info.license,
    version: schema.version,
    description: schema.description ?? undefined,
    termsOfService: schema.termsOfService ?? undefined,
  };
  // TODO: support external docs
  spec.tags = schema.tags.map((tag) => ({
    name: tag.name,
    description: tag.description ?? undefined,
  }));
  spec.security = schema.securityRequirements.map((requirement) => ({
    [requirement.securityScheme.identifier]: requirement.scopes.map(
      (scope) => scope.name
    ),
  }));

  if (schema.securityOptional) {
    spec.security = [{}];
  }

  spec.servers = schema.servers.map(generateServer);

  spec.paths = {};

  for (const path of schema.paths) {
    spec.paths[path.path] = generatePathSpec(path);
  }

  spec.components = originalSpec.components;

  for (const securityScheme of schema.securitySchemes) {
    const existingSchemes = spec.components?.securitySchemes ?? {};

    (spec.components ?? {}).securitySchemes = {
      ...existingSchemes,
      [securityScheme.identifier]: generateSecurityScheme(
        securityScheme,
        existingSchemes[
          securityScheme.identifier
        ] as OpenAPIV3_1.SecuritySchemeObject
      ),
    };
  }

  return spec as OpenAPIV3_1.Document;
}

// TODO: support server variables
function generateServer(server: ApiSchemaServer): OpenAPIV3_1.ServerObject {
  return {
    url: server.url,
    description: server.description ?? undefined,
  };
}

function generateSecurityScheme(
  securityScheme: GenerateSpecSchemaType["securitySchemes"][0],
  existingScheme: OpenAPIV3_1.SecuritySchemeObject | undefined
): OpenAPIV3_1.SecuritySchemeObject {
  function mapSecuritySchemeType(type: ApiSchemaSecuritySchemeType) {
    switch (type) {
      case "APIKEY":
        return "apiKey";
      case "HTTP":
        return "http";
      case "OAUTH2":
        return "oauth2";
      case "OPENIDCONNECT":
        return "openIdConnect";
      default:
        throw new Error(`Unknown security scheme type: ${type}`);
    }
  }

  function mapOAuthFlowType(type: ApiSchemaSecurityOAuthFlowType) {
    switch (type) {
      case "IMPLICIT":
        return "implicit";
      case "PASSWORD":
        return "password";
      case "CLIENT_CREDENTIALS":
        return "clientCredentials";
      case "AUTHORIZATION_CODE":
        return "authorizationCode";
      default:
        throw new Error(`Unknown OAuth flow type ${type}`);
    }
  }

  const securitySchemeObject: DeepPartial<OpenAPIV3_1.SecuritySchemeObject> =
    {};

  securitySchemeObject.description = securityScheme.description ?? undefined;
  securitySchemeObject.type = mapSecuritySchemeType(securityScheme.type);

  switch (securitySchemeObject.type) {
    case "http": {
      securitySchemeObject.scheme = securityScheme.httpScheme ?? undefined;
      securitySchemeObject.bearerFormat =
        securityScheme.bearerFormat ?? undefined;
      break;
    }
    case "apiKey": {
      securitySchemeObject.name = securityScheme.identifier;
      securitySchemeObject.in = securityScheme.location ?? undefined;
      break;
    }
    case "openIdConnect": {
      securitySchemeObject.openIdConnectUrl =
        securityScheme.openIdConnectUrl ?? undefined;
      break;
    }
    case "oauth2": {
      securitySchemeObject.flows = {
        ...((existingScheme &&
          existingScheme.type === "oauth2" &&
          existingScheme.flows) ??
          {}),
      };

      for (const oauthFlow of securityScheme.oauthFlows) {
        if (oauthFlow.type === "DEVICE_CODE") {
          (securitySchemeObject.flows as any)["x-apihero"] = {
            deviceAuthorization: {
              tokenUrl: oauthFlow.tokenUrl ?? undefined,
              deviceAuthorizationUrl:
                oauthFlow.deviceAuthorizationUrl ?? undefined,
              scopes: oauthFlow.scopes.reduce(
                (acc, scope) => ({ ...acc, [scope.name]: scope.description }),
                {} as Record<string, string>
              ),
            },
          };

          continue;
        }

        securitySchemeObject.flows[mapOAuthFlowType(oauthFlow.type)] = {
          authorizationUrl: oauthFlow.authorizationUrl ?? undefined,
          tokenUrl: oauthFlow.tokenUrl ?? undefined,
          refreshUrl: oauthFlow.refreshUrl ?? undefined,
          scopes: oauthFlow.scopes.reduce(
            (acc, scope) => ({ ...acc, [scope.name]: scope.description }),
            {} as Record<string, string>
          ),
        };
      }

      break;
    }
  }

  if (
    securitySchemeObject.type === "http" ||
    securitySchemeObject.type === "apiKey"
  ) {
    if (securityScheme.scopes.length > 0) {
      const securitySchemeExtensions = {} as NonNullable<
        ApiHeroExtensions["securityScheme"]
      >;

      securitySchemeExtensions.scopes = securityScheme.scopes.reduce(
        (acc, scope) => ({ ...acc, [scope.name]: scope.description }),
        {} as Record<string, string>
      );

      (securitySchemeObject as any)["x-apihero"] = securitySchemeExtensions;
    }
  }

  if (securityScheme.title || securityScheme.summary) {
    const securitySchemeExtensions =
      (securitySchemeObject as any)["x-apihero"] ??
      ({} as NonNullable<ApiHeroExtensions["securityScheme"]>);

    securitySchemeExtensions.title = securityScheme.title;
    securitySchemeExtensions.summary = securityScheme.summary;
  }

  return securitySchemeObject as OpenAPIV3_1.SecuritySchemeObject;
}

type GeneratePathSpecType = GenerateSpecSchemaType["paths"][0];

// TODO: support path item reference objects
function generatePathSpec(
  path: GeneratePathSpecType
): OpenAPIV3_1.PathItemObject {
  const spec: DeepPartial<OpenAPIV3_1.PathItemObject> = {};

  spec.summary = path.summary ?? undefined;
  spec.description = path.description ?? undefined;

  if (path.servers.length > 0) {
    spec.servers = path.servers.map(generateServer);
  }

  if (path.parameters.length > 0) {
    spec.parameters = path.parameters.map((parameter) => ({
      name: parameter.name,
    }));
  }

  for (const operation of path.operations) {
    if (operation.method === "GET") {
      spec.get = generateOperationSpec(operation);
    }
    if (operation.method === "POST") {
      spec.post = generateOperationSpec(operation);
    }
    if (operation.method === "PUT") {
      spec.put = generateOperationSpec(operation);
    }
    if (operation.method === "DELETE") {
      spec.delete = generateOperationSpec(operation);
    }
    if (operation.method === "PATCH") {
      spec.patch = generateOperationSpec(operation);
    }
    if (operation.method === "OPTIONS") {
      spec.options = generateOperationSpec(operation);
    }
    if (operation.method === "HEAD") {
      spec.head = generateOperationSpec(operation);
    }
    if (operation.method === "TRACE") {
      spec.trace = generateOperationSpec(operation);
    }
  }

  return spec as OpenAPIV3_1.PathItemObject;
}

type GenerateOperationSpecType = GeneratePathSpecType["operations"][0];

function generateOperationSpec(
  operation: GenerateOperationSpecType
): OpenAPIV3_1.OperationObject {
  const spec: DeepPartial<OpenAPIV3_1.OperationObject> = {};

  spec.operationId = operation.operationId;
  spec.summary = operation.summary ?? undefined;
  spec.description = operation.description ?? undefined;
  spec.deprecated = operation.deprecated ?? undefined;
  spec.externalDocs =
    operation.externalDocsUrl && operation.externalDocsDescription
      ? {
          url: operation.externalDocsUrl ?? undefined,
          description: operation.externalDocsDescription ?? undefined,
        }
      : undefined;

  if (operation.tags.length > 0) {
    spec.tags = operation.tags.map((tag) => tag.name);
  }

  if (operation.servers.length > 0) {
    spec.servers = operation.servers.map(generateServer);
  }

  if (operation.securityRequirements.length > 0) {
    spec.security = operation.securityRequirements.map((requirement) => ({
      [requirement.securityScheme.identifier]: requirement.scopes.map(
        (scope) => scope.name
      ),
    }));

    if (operation.securityOptional) {
      if (spec.security) {
        spec.security.push({});
      } else {
        spec.security = [{}];
      }
    }
  }

  if (operation.parameters.length > 0) {
    spec.parameters = operation.parameters.map((parameter) => {
      return generateParameterSpec(parameter);
    });
  }

  if (operation.responseBodies.length > 0) {
    spec.responses = {};

    for (const response of operation.responseBodies) {
      if (response.isDefault) {
        spec.responses["default"] = generateResponseSpec(response);
      } else if (response.statusCode) {
        spec.responses[response.statusCode] = generateResponseSpec(response);
      }
    }
  }

  if (operation.requestBody) {
    spec.requestBody = generateRequestBodySpec(operation.requestBody);
  }

  if (operation.extensions) {
    const extensions = operation.extensions as Record<string, any>;

    for (const extension of Object.keys(extensions)) {
      spec[extension as keyof typeof spec] = extensions[extension];
    }
  }

  if (operation.mappings) {
    const operationExtensions = {
      mappings: operation.mappings,
    } as ApiHeroExtensions["operation"];

    return {
      ...spec,
      "x-apihero": { ...operationExtensions },
    } as OpenAPIV3_1.OperationObject;
  }

  return spec as OpenAPIV3_1.OperationObject;
}

function mapParameterStyle(
  style?: ApiSchemaParameterStyle
): string | undefined {
  if (!style) {
    return;
  }

  return style.toLocaleLowerCase();
}

type GenerateRequestBodySpecType = GenerateOperationSpecType["requestBody"];

function generateRequestBodySpec(
  requestBody: GenerateRequestBodySpecType
): OpenAPIV3_1.RequestBodyObject | OpenAPIV3_1.ReferenceObject | undefined {
  if (!requestBody) {
    return;
  }

  if (requestBody.ref) {
    return {
      $ref: requestBody.ref,
      summary: requestBody.summary ?? undefined,
      description: requestBody.description ?? undefined,
    };
  }

  const spec: DeepPartial<OpenAPIV3_1.RequestBodyObject> = {};

  spec.description = requestBody.description ?? undefined;
  spec.required = requestBody.required ?? null;

  if (requestBody.contents.length > 0) {
    spec.content = {};

    for (const content of requestBody.contents) {
      spec.content[content.mediaTypeRange] = {
        schema: content.validationSchema as any,
        example: content.example ?? undefined,
        encoding: (content.encoding as any) ?? undefined,
        examples:
          content.examples.length > 0
            ? generateExamplesSpec(content.examples)
            : undefined,
      };
    }
  }

  return spec as OpenAPIV3_1.RequestBodyObject;
}

function generateExamplesSpec(
  examples: ApiSchemaExample[]
): Record<string, OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject> {
  const spec = {} as ReturnType<typeof generateExamplesSpec>;

  for (const example of examples) {
    spec[example.name ?? "default"] = generateExampleSpec(example);
  }

  return spec;
}

function generateExampleSpec(
  example: ApiSchemaExample
): OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject {
  if (example.ref) {
    return {
      $ref: example.ref,
      summary: example.summary ?? undefined,
      description: example.description ?? undefined,
    };
  } else {
    return {
      value: example.value,
      externalValue: example.externalValue ?? undefined,
      description: example.description ?? undefined,
    };
  }
}

type GenerateParameterSpecType = GenerateOperationSpecType["parameters"][0];

function generateParameterSpec(
  parameter: GenerateParameterSpecType
): OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ReferenceObject {
  if (parameter.ref) {
    return {
      $ref: parameter.ref,
      summary: parameter.summary ?? undefined,
      description: parameter.description ?? undefined,
    };
  } else {
    return {
      name: parameter.name,
      in: parameter.location.toLowerCase(),
      description: parameter.description ?? undefined,
      required: parameter.required ?? false,
      schema:
        (parameter.validationSchema as OpenAPIV3_1.ParameterObject["schema"]) ??
        undefined,
      deprecated: parameter.deprecated ?? false,
      allowEmptyValue: parameter.allowEmptyValue ?? undefined,
      style: mapParameterStyle(parameter.style) ?? undefined,
      explode: parameter.explode,
      allowReserved: parameter.allowReserved ?? undefined,
      example: parameter.example ?? undefined,
      examples:
        parameter.examples.length > 0
          ? generateExamplesSpec(parameter.examples)
          : undefined,
    };
  }
}

type GenerateResponseBodySpecType =
  GenerateOperationSpecType["responseBodies"][0];

function generateResponseSpec(
  responseBody: GenerateResponseBodySpecType
): OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ReferenceObject {
  if (responseBody.ref) {
    return {
      $ref: responseBody.ref,
      summary: responseBody.summary ?? undefined,
      description: responseBody.description ?? undefined,
    };
  }

  const spec: DeepPartial<OpenAPIV3_1.ResponseObject> = {};

  spec.description = responseBody.description ?? undefined;

  if (responseBody.contents.length > 0) {
    spec.content = {};

    for (const content of responseBody.contents) {
      spec.content[content.mediaTypeRange] = {
        schema: content.validationSchema as any,
        example: content.example ?? undefined,
        encoding: (content.encoding as any) ?? undefined,
        examples:
          content.examples.length > 0
            ? generateExamplesSpec(content.examples)
            : undefined,
      };
    }
  }

  if (responseBody.headers.length > 0) {
    spec.headers = {};

    for (const header of responseBody.headers) {
      spec.headers[header.name] = generateHeaderSpec(header);
    }
  }

  return spec as OpenAPIV3_1.ResponseObject;
}

type GenerateSpecHeaderType = GenerateResponseBodySpecType["headers"][0];

function generateHeaderSpec(
  header: GenerateSpecHeaderType
): OpenAPIV3_1.HeaderObject | OpenAPIV3_1.ReferenceObject {
  return header.ref
    ? {
        $ref: header.ref,
        summary: header.summary ?? undefined,
        description: header.description ?? undefined,
      }
    : {
        description: header.description ?? undefined,
        required: header.required ?? false,
        schema: (header.validationSchema as any) ?? undefined,
        deprecated: header.deprecated ?? false,
        style: mapParameterStyle(header.style) ?? undefined,
        explode: header.explode,
        example: header.example ?? undefined,
        examples:
          header.examples.length > 0
            ? generateExamplesSpec(header.examples)
            : undefined,
      };
}

function generateSpecScopedToOperation(
  schema: GenerateSpecSchemaType,
  operation: NonNullable<Awaited<ReturnType<typeof findOperationById>>>
): OpenAPIV3_1.Document {
  const fullSpec = generateSpec(schema);

  const path = schema.paths.find((path) =>
    path.operations.some((op) => op.operationId === operation.operationId)
  );

  if (!path) {
    throw new Error(`Operation ${operation.operationId} not found in schema`);
  }

  const schemaOperation = path.operations.find(
    (op) => op.operationId === operation.operationId
  );

  if (!schemaOperation) {
    throw new Error(`Operation ${operation.operationId} not found in schema`);
  }

  const spec: DeepPartial<OpenAPIV3_1.Document> = {};

  spec.openapi = "3.1.0";
  spec.info = {
    version: schema.version,
  };
  spec.tags = [];

  for (const tag of operation.tags) {
    spec.tags.push({
      name: tag.name,
      description: tag.description ?? undefined,
    });
  }

  spec.servers = schema.servers.map(generateServer);

  spec.paths = {};

  const pathSpec: DeepPartial<OpenAPIV3_1.PathItemObject> = {};

  pathSpec.summary = path.summary ?? undefined;
  pathSpec.description = path.description ?? undefined;

  if (path.servers.length > 0) {
    pathSpec.servers = path.servers.map(generateServer);
  }

  if (path.parameters.length > 0) {
    pathSpec.parameters = path.parameters.map((parameter) => ({
      name: parameter.name,
    }));
  }

  if (schemaOperation.method === "GET") {
    pathSpec.get = generateOperationSpec(schemaOperation);
  }
  if (schemaOperation.method === "POST") {
    pathSpec.post = generateOperationSpec(schemaOperation);
  }
  if (schemaOperation.method === "PUT") {
    pathSpec.put = generateOperationSpec(schemaOperation);
  }
  if (schemaOperation.method === "DELETE") {
    pathSpec.delete = generateOperationSpec(schemaOperation);
  }
  if (schemaOperation.method === "PATCH") {
    pathSpec.patch = generateOperationSpec(schemaOperation);
  }
  if (schemaOperation.method === "OPTIONS") {
    pathSpec.options = generateOperationSpec(schemaOperation);
  }
  if (schemaOperation.method === "HEAD") {
    pathSpec.head = generateOperationSpec(schemaOperation);
  }
  if (schemaOperation.method === "TRACE") {
    pathSpec.trace = generateOperationSpec(schemaOperation);
  }

  spec.paths[path.path] = pathSpec;

  const components: DeepPartial<OpenAPIV3_1.ComponentsObject> = {};

  components.schemas = {};
  components.responses = {};
  components.examples = {};
  components.parameters = {};
  components.headers = {};
  components.requestBodies = {};

  let refs = new Set<string>();

  for (const responseBody of schemaOperation.responseBodies) {
    if (responseBody.ref) {
      components.responses[nameFromRef(responseBody.ref)] =
        generateResponseSpec({ ...responseBody, ref: null });
    }

    for (const header of responseBody.headers) {
      if (header.ref) {
        components.headers[nameFromRef(header.ref)] = generateHeaderSpec({
          ...header,
          ref: null,
        });
      }

      for (const example of header.examples) {
        if (example.ref) {
          components.examples[nameFromRef(example.ref)] = generateExampleSpec({
            ...example,
            ref: null,
          });
        }
      }
    }

    for (const responseBodyContent of responseBody.contents) {
      refs = new Set<string>([
        ...refs,
        ...getAllRefsFromSchema(responseBodyContent.validationSchema),
      ]);

      for (const example of responseBodyContent.examples) {
        if (example.ref) {
          components.examples[nameFromRef(example.ref)] = generateExampleSpec({
            ...example,
            ref: null,
          });
        }
      }
    }
  }

  for (const parameters of schemaOperation.parameters) {
    if (parameters.ref) {
      components.parameters[nameFromRef(parameters.ref)] =
        generateParameterSpec({ ...parameters, ref: null });
    }
  }

  if (schemaOperation.requestBody) {
    if (schemaOperation.requestBody.ref) {
      components.requestBodies[nameFromRef(schemaOperation.requestBody.ref)] =
        generateRequestBodySpec({ ...schemaOperation.requestBody, ref: null });
    }

    for (const requestBodyContent of schemaOperation.requestBody.contents) {
      refs = new Set<string>([
        ...refs,
        ...getAllRefsFromSchema(requestBodyContent.validationSchema),
      ]);

      for (const example of requestBodyContent.examples) {
        if (example.ref) {
          components.examples[nameFromRef(example.ref)] = generateExampleSpec({
            ...example,
            ref: null,
          });
        }
      }
    }
  }

  spec.components = components;

  for (const ref of refs) {
    copyRefToSpec(ref, fullSpec, spec as OpenAPIV3_1.Document);
  }

  // Get all the references from the path and the operation

  return spec as OpenAPIV3_1.Document;
}

function copyRefToSpec(
  ref: string,
  fullSpec: OpenAPIV3_1.Document,
  spec: OpenAPIV3_1.Document
) {
  const refName = nameFromRef(ref);
  const refSection = sectionFromRef(ref);
  const specComponentsSection =
    fullSpec.components?.[refSection as keyof typeof fullSpec.components];

  if (!specComponentsSection) {
    throw new Error(`Ref section ${refSection} not found in full spec`);
  }

  const specSchema = specComponentsSection[refName];

  if (!specSchema) {
    throw new Error(`Ref ${ref} not found in full spec`);
  }

  if (!spec.components) {
    spec.components = {};
  }

  const targetSection =
    spec.components[refSection as keyof typeof spec.components];

  if (!targetSection) {
    throw new Error(`Ref ${ref} not found in spec`);
  }

  targetSection[refName as keyof typeof targetSection] = specSchema as any;

  const refs = getAllRefsFromSchema(specSchema as any);

  for (const ref of refs) {
    copyRefToSpec(ref, fullSpec, spec);
  }
}

/*
Find all the refs from a schema, recursively

For example, this schema
{
  "$ref": "#/components/parameters/foo",
  "properties": {
    "id": {
      "$ref": "#/components/properties/id"
    }
  }
}

Should return an arroy of ["#/components/parameters/foo", "#/components/properties/id"]
*/
function getAllRefsFromSchema(schema: Prisma.JsonValue | undefined): string[] {
  if (!schema) {
    return [];
  }

  if (
    typeof schema === "string" ||
    typeof schema === "number" ||
    typeof schema === "boolean"
  ) {
    return [];
  }

  if (Array.isArray(schema)) {
    return schema.flatMap((item) => getAllRefsFromSchema(item));
  }

  if (typeof schema === "object") {
    const childrenRefs = Object.values(schema).flatMap((item) =>
      getAllRefsFromSchema(item)
    );

    if (schema.$ref && typeof schema.$ref === "string") {
      return [...childrenRefs, schema.$ref];
    }

    return childrenRefs;
  }

  return [];
}

function nameFromRef(ref: string): string {
  return ref.split("/").pop() as string;
}

// if the ref is #/components/parameters/repo
// then the sectionFromRef should be parameters
function sectionFromRef(ref: string): string {
  const parts = ref.split("/");

  if (parts.length < 3) {
    return "";
  }

  return parts[2];
}

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
