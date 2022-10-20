import type {
  ApiSchema,
  ApiSchemaModel,
  ApiSchemaOperation,
  ApiSchemaParameterLocation,
  ApiSchemaParameterStyle,
  ApiSchemaPath,
  ApiSchemaRequestBody,
  ApiSchemaResponseBody,
  ApiSchemaSecurityScheme,
  ApiSchemaSecuritySchemeLocation,
  ApiSchemaSecuritySchemeType,
  ApiSchemaServer,
  ApiSchemaTag,
  HTTPMethod,
  Integration,
} from "~/db.server";
import { prisma } from "~/db.server";
import type { OpenAPIV3_1, OpenAPIV3, OpenAPIV2, OpenAPI } from "openapi-types";
import type { Mapping } from "@apihero/openapi-spec-generator/lib/generate";

export { Integration };

export type ApiHeroExtensions = {
  securityScheme?: {
    scopes?: Record<string, string>;
    title?: string;
    summary?: string;
  };
  oauthFlows?: {
    deviceAuthorization?: {
      scopes: Record<string, string>;
      tokenUrl: string;
      deviceAuthorizationUrl: string;
    };
  };
  operation?: {
    mappings?: Mapping[];
  };
};

export async function getAllIntegrations() {
  return prisma.integration.findMany({
    include: {
      currentSchema: true,
    },
  });
}

export async function findIntegrationBySlug(slug: Integration["slug"]) {
  return prisma.integration.findFirst({
    where: {
      slug,
    },
  });
}

export async function findIntegrationById(id: Integration["id"]) {
  return prisma.integration.findFirst({
    where: {
      id,
    },
    include: {
      currentSchema: true,
    },
  });
}

export async function searchIntegrations({ query }: { query: string }) {
  const integrations = await prisma.integration.findMany({
    where: {
      OR: [
        {
          slug: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
  });

  return integrations.map((i) => ({ ...i, packageName: `@apihero/${i.slug}` }));
}

export async function createIntegration(
  {
    slug,
    name,
    authorNotes,
    keywords,
    description,
    officialDocumentation,
  }: Pick<Integration, "slug" | "authorNotes" | "name"> &
    Partial<
      Pick<Integration, "keywords" | "description" | "officialDocumentation">
    >,
  data: any
) {
  const integration = await prisma.integration.create({
    data: {
      slug,
      name,
      authorNotes,
      keywords,
      description,
      officialDocumentation,
    },
  });

  await createIntegrationSchema(integration, data as OpenAPI.Document);

  return integration;
}

async function createIntegrationSchema(
  integration: Integration,
  doc: OpenAPI.Document
) {
  if ("openapi" in doc) {
    if (doc.openapi.startsWith("3.0.")) {
      return createIntegrationSchemaV3(integration, doc as OpenAPIV3.Document);
    }

    if (doc.openapi.startsWith("3.1.")) {
      return createIntegrationSchemaV3_1(
        integration,
        doc as OpenAPIV3_1.Document
      );
    }

    throw new Error(`Unsupported OpenAPI version: ${doc.openapi}`);
  }

  if ("swagger" in doc) {
    return createIntegrationSchemaV2(integration, doc as OpenAPIV2.Document);
  }
}

async function createIntegrationSchemaV3_1(
  integration: Integration,
  doc: OpenAPIV3_1.Document
) {
  const schema = await prisma.apiSchema.create({
    data: {
      integrationId: integration.id,
      title: doc.info.title,
      version: doc.info.version,
      openApiVersion: doc.openapi,
      description: doc.info.description,
      termsOfService: doc.info.termsOfService,
      license: doc.info.license
        ? `${doc.info.license.name} ${doc.info.license.url}`
        : null,
      contact: doc.info.contact
        ? `${doc.info.contact.name} ${doc.info.contact.email} ${doc.info.contact.url}`
        : null,
      jsonSchemaDialect: doc.jsonSchemaDialect,
      externalDocsUrl: doc.externalDocs?.url,
      externalDocsDescription: doc.externalDocs?.description,
      securityOptional: isSecurityOptional(doc.security),
      rawData: doc as any,
    },
  });

  await createSchemaServers(doc.servers, { schemaId: schema.id });
  await createSchemaTags(schema, doc.tags);
  await createSecuritySchemes(schema, doc, doc.components?.securitySchemes);
  await createSchemaModels(schema, doc);
  await createSecurityRequirements(schema, doc.security);
  await createSchemaPaths(schema, doc);

  return schema;
}

function isSecurityOptional(
  security: OpenAPIV3_1.SecurityRequirementObject[] | undefined
): boolean {
  return (
    security === undefined || security.some((s) => Object.keys(s).length === 0)
  );
}

async function createSchemaModels(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document
): Promise<Record<string, ApiSchemaModel>> {
  const models: Record<string, ApiSchemaModel> = {};
  if (!doc.components?.schemas) {
    return models;
  }

  for (const [name, schemaItem] of Object.entries(doc.components.schemas)) {
    if (!schemaItem) {
      continue;
    }

    const model = await prisma.apiSchemaModel.create({
      data: {
        name,
        schemaId: schema.id,
        contents: schemaItem as any,
      },
    });

    models[name] = model;
  }

  return models;
}

async function createSchemaPaths(schema: ApiSchema, doc: OpenAPIV3_1.Document) {
  if (!doc.paths) {
    return;
  }

  let sortIndex = 0;

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    await createSchemaPath(
      schema,
      doc,
      path,
      pathItem as OpenAPIV3_1.PathItemObject,
      sortIndex
    );

    sortIndex++;
  }
}

async function createSchemaPath(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  path: string,
  pathItem: OpenAPIV3_1.PathItemObject,
  sortIndex: number
) {
  const apiPath = await prisma.apiSchemaPath.create({
    data: {
      path,
      sortIndex,
      summary: pathItem.summary,
      description: pathItem.description,
      schemaId: schema.id,
      rawJson: pathItem as any,
      servers: {
        create: pathItem.servers?.map((server) => ({
          url: server.url,
          description: server.description,
          schemaId: schema.id,
        })),
      },
    },
  });

  await createParameters(schema, doc, apiPath, pathItem.parameters);
  await createSchemaServers(pathItem.servers, { pathId: apiPath.id });

  const supportedMethods = Object.keys(pathItem).filter((k) =>
    isHttpMethod(k)
  ) as OpenAPIV3_1.HttpMethods[];

  let operationSortIndex = sortIndex * 100;

  for (const method of supportedMethods) {
    const operation = pathItem[method];

    if (!operation) {
      continue;
    }

    await createPathOperation(
      schema,
      doc,
      apiPath,
      method,
      operation,
      operationSortIndex
    );

    operationSortIndex++;
  }
}

async function createPathOperation(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  path: ApiSchemaPath,
  method: OpenAPIV3_1.HttpMethods,
  operation: OpenAPIV3_1.OperationObject,
  sortIndex: number
) {
  const extensions = Object.keys(operation)
    .filter(
      (k) =>
        k.startsWith("x-") && !k.startsWith("x-oai-") && !k.startsWith("x-oas-")
    )
    .reduce((acc, k) => {
      acc[k] = operation[k as keyof typeof operation];
      return acc;
    }, {} as Record<string, any>);

  // Operation
  const apiOperation = await prisma.apiSchemaOperation.create({
    data: {
      pathId: path.id,
      sortIndex,
      schemaId: schema.id,
      method: mapHttpMethod(method),
      operationId: operation.operationId ?? `${method}:${path.path}`,
      summary: operation.summary,
      description: operation.description,
      externalDocsUrl: operation.externalDocs?.url,
      externalDocsDescription: operation.externalDocs?.description,
      deprecated: operation.deprecated,
      securityOptional: isSecurityOptional(operation.security),
      extensions,
      tags: {
        connectOrCreate: operation.tags
          ? operation.tags.map((tag) => ({
              where: {
                name_schemaId: {
                  name: tag,
                  schemaId: schema.id,
                },
              },
              create: {
                name: tag,
                schemaId: schema.id,
              },
            }))
          : undefined,
      },
    },
  });
  // Parameters
  await createParameters(schema, doc, apiOperation, operation.parameters);
  // Servers
  await createSchemaServers(operation.servers, {
    operationId: apiOperation.id,
  });

  // Responses
  await createOperationResponseBodies(
    schema,
    doc,
    apiOperation,
    operation.responses
  );
  // Request Body
  await createOperationRequestBody(
    schema,
    doc,
    apiOperation,
    operation.requestBody
  );
  // Seurity Requirements (& security optional)
  await createSecurityRequirements(schema, operation.security, {
    operationId: apiOperation.id,
  });
}

async function createOperationRequestBody(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  operation: ApiSchemaOperation,
  requestBody: OpenAPIV3_1.OperationObject["requestBody"]
) {
  if (!requestBody) {
    return;
  }

  const ref = "$ref" in requestBody ? requestBody.$ref : undefined;

  const resolvedRequestBody = resolveRef<OpenAPIV3_1.RequestBodyObject>(
    doc,
    requestBody
  );

  if (ref) {
    const existingRequestBody = await prisma.apiSchemaRequestBody.findFirst({
      where: {
        schemaId: schema.id,
        ref,
      },
    });

    if (existingRequestBody) {
      await prisma.apiSchemaRequestBody.update({
        data: {
          operations: {
            connect: { id: operation.id },
          },
        },
        where: {
          id: existingRequestBody.id,
        },
      });

      return existingRequestBody;
    }
  }

  const newRequestBody = await prisma.apiSchemaRequestBody.create({
    data: {
      ref,
      description: resolvedRequestBody.description,
      required: resolvedRequestBody.required,
      operations: {
        connect: { id: operation.id },
      },
      schemaId: schema.id,
    },
  });

  for (const [mediaTypeRange, content] of Object.entries(
    resolvedRequestBody.content ?? {}
  )) {
    await createOperationRequestBodyContent(
      schema,
      doc,
      newRequestBody,
      mediaTypeRange,
      content
    );
  }
}

async function createOperationResponseBodies(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  operation: ApiSchemaOperation,
  responses: OpenAPIV3_1.OperationObject["responses"]
) {
  if (!responses) {
    return;
  }

  await createOperationResponseBody(schema, doc, operation, responses.default, {
    isDefault: true,
  });

  for (const [statusCode, response] of Object.entries(responses)) {
    if (statusCode === "default") {
      continue;
    }

    await createOperationResponseBody(schema, doc, operation, response, {
      isDefault: false,
      statusCode,
    });
  }
}

async function createOperationResponseBody(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  operation: ApiSchemaOperation,
  response?: OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ReferenceObject,
  attributes: Partial<
    Pick<ApiSchemaResponseBody, "isDefault" | "statusCode">
  > = {}
) {
  if (!response) {
    return;
  }

  const ref = "$ref" in response ? response.$ref : undefined;

  const resolvedResponse = resolveRef<OpenAPIV3_1.ResponseObject>(
    doc,
    response
  );

  if (ref) {
    const existingResponseBody = await prisma.apiSchemaResponseBody.findFirst({
      where: {
        schemaId: schema.id,
        ref,
      },
    });

    if (existingResponseBody) {
      await prisma.apiSchemaResponseBody.update({
        data: {
          operations: {
            connect: { id: operation.id },
          },
        },
        where: {
          id: existingResponseBody.id,
        },
      });

      return existingResponseBody;
    }
  }

  const newResponseBody = await prisma.apiSchemaResponseBody.create({
    data: {
      ref,
      description: resolvedResponse.description,
      ...attributes,
      operations: {
        connect: { id: operation.id },
      },
      schemaId: schema.id,
    },
  });

  for (const [mediaTypeRange, content] of Object.entries(
    resolvedResponse.content ?? {}
  )) {
    await createOperationResponseBodyContent(
      schema,
      doc,
      newResponseBody,
      mediaTypeRange,
      content
    );
  }

  for (const [name, header] of Object.entries(resolvedResponse.headers ?? {})) {
    await createOperationResponseBodyHeader(
      schema,
      doc,
      newResponseBody,
      name,
      header
    );
  }
}

async function createOperationResponseBodyHeader(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  response: ApiSchemaResponseBody,
  name: string,
  headerOrRef: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.HeaderObject
) {
  const ref = "$ref" in headerOrRef ? headerOrRef.$ref : undefined;

  if (ref) {
    const existingHeader = await prisma.apiSchemaResponseHeader.findFirst({
      where: {
        schemaId: schema.id,
        ref,
      },
    });

    if (existingHeader) {
      await prisma.apiSchemaResponseHeader.update({
        where: {
          id: existingHeader.id,
        },
        data: {
          responseBodies: {
            connect: { id: response.id },
          },
        },
      });

      return existingHeader;
    }
  }

  const resolvedHeader = resolveRef<OpenAPIV3_1.HeaderObject>(doc, headerOrRef);

  const newHeader = await prisma.apiSchemaResponseHeader.create({
    data: {
      ref,
      name: name,
      required: resolvedHeader.required,
      description: resolvedHeader.description,
      summary: "$ref" in headerOrRef ? headerOrRef.summary : undefined,
      style: mapParameterStyle(resolvedHeader.style),
      explode: resolvedHeader.explode,
      deprecated: resolvedHeader.deprecated,
      validationSchema: resolvedHeader.schema
        ? (resolveRef<OpenAPIV3_1.SchemaObject>(
            doc,
            resolvedHeader.schema
          ) as any)
        : undefined,
      example: resolvedHeader.example,
      schemaId: schema.id,
      responseBodies: {
        connect: { id: response.id },
      },
    },
  });

  for (const [mediaType, refOrExample] of Object.entries(
    resolvedHeader.examples ?? {}
  )) {
    await createSchemaExample(
      schema,
      doc,
      { responseHeaderId: newHeader.id },
      mediaType,
      refOrExample
    );
  }

  return newHeader;
}

async function createSchemaExample(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  parent:
    | { responseBodyContentId: string }
    | { parameterId: string }
    | { responseHeaderId: string }
    | { requestBodyContentId: string },
  mediaTypeRange: string,
  exampleOrRef: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject
) {
  const ref = "$ref" in exampleOrRef ? exampleOrRef.$ref : undefined;

  if (ref) {
    const existingExample = await prisma.apiSchemaExample.findFirst({
      where: {
        schemaId: schema.id,
        ref,
      },
    });

    if (existingExample) {
      await prisma.apiSchemaExample.update({
        where: {
          id: existingExample.id,
        },
        data: {
          responseBodyContents:
            "responseBodyContentId" in parent
              ? { connect: { id: parent.responseBodyContentId } }
              : undefined,
          requestBodyContents:
            "requestBodyContentId" in parent
              ? { connect: { id: parent.requestBodyContentId } }
              : undefined,
          parameters:
            "parameterId" in parent
              ? { connect: { id: parent.parameterId } }
              : undefined,
          responseHeaders:
            "responseHeaderId" in parent
              ? { connect: { id: parent.responseHeaderId } }
              : undefined,
        },
      });

      return existingExample;
    }
  }

  const resolvedExample = resolveRef<OpenAPIV3_1.ExampleObject>(
    doc,
    exampleOrRef
  );

  return prisma.apiSchemaExample.create({
    data: {
      ref,
      isDefault: mediaTypeRange === "default",
      name: mediaTypeRange,
      summary: resolvedExample.summary,
      description: resolvedExample.description,
      schemaId: schema.id,
      value: resolvedExample.value ?? undefined,
      externalValue: resolvedExample.externalValue ?? undefined,
      responseBodyContents:
        "responseBodyContentId" in parent
          ? { connect: { id: parent.responseBodyContentId } }
          : undefined,
      requestBodyContents:
        "requestBodyContentId" in parent
          ? { connect: { id: parent.requestBodyContentId } }
          : undefined,
      parameters:
        "parameterId" in parent
          ? { connect: { id: parent.parameterId } }
          : undefined,
      responseHeaders:
        "responseHeaderId" in parent
          ? { connect: { id: parent.responseHeaderId } }
          : undefined,
    },
  });
}

async function createOperationResponseBodyContent(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  response: ApiSchemaResponseBody,
  mediaTypeRange: string,
  content: OpenAPIV3_1.MediaTypeObject
) {
  const resolvedContent = resolveRef<OpenAPIV3_1.MediaTypeObject>(doc, content);

  const apiResponseBodyContent =
    await prisma.apiSchemaResponseBodyContent.create({
      data: {
        responseBodyId: response.id,
        mediaTypeRange,
        validationSchema: resolvedContent.schema as any,
        encoding: content.encoding as any,
        example: content.example,
      },
    });

  for (const [mediaType, refOrExample] of Object.entries(
    resolvedContent.examples ?? {}
  )) {
    await createSchemaExample(
      schema,
      doc,
      { responseBodyContentId: apiResponseBodyContent.id },
      mediaType,
      refOrExample
    );
  }

  return apiResponseBodyContent;
}

async function createOperationRequestBodyContent(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  requestBody: ApiSchemaRequestBody,
  mediaTypeRange: string,
  content: OpenAPIV3_1.MediaTypeObject
) {
  const resolvedContent = resolveRef<OpenAPIV3_1.MediaTypeObject>(doc, content);

  const apiRequestBodyContent = await prisma.apiSchemaRequestBodyContent.create(
    {
      data: {
        requestBodyId: requestBody.id,
        mediaTypeRange,
        validationSchema: resolvedContent.schema as any,
        encoding: content.encoding as any,
        example: content.example,
      },
    }
  );

  for (const [mediaType, refOrExample] of Object.entries(
    resolvedContent.examples ?? {}
  )) {
    await createSchemaExample(
      schema,
      doc,
      { requestBodyContentId: apiRequestBodyContent.id },
      mediaType,
      refOrExample
    );
  }

  return apiRequestBodyContent;
}

function isHttpMethod(method: string): method is OpenAPIV3_1.HttpMethods {
  return [
    "get",
    "post",
    "put",
    "delete",
    "options",
    "head",
    "patch",
    "trace",
  ].includes(method);
}

function isApiSchemaPath(v: any): v is ApiSchemaPath {
  return "id" in v && "path" in v;
}

async function createParameters(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  parent: ApiSchemaPath | ApiSchemaOperation,
  parameters: OpenAPIV3_1.PathItemObject["parameters"]
) {
  if (!parameters) {
    return;
  }

  return Promise.all(
    parameters.map(async (paramOrRef) => {
      const ref = "$ref" in paramOrRef ? paramOrRef.$ref : undefined;
      const resolvedParam = resolveRef<OpenAPIV3_1.ParameterObject>(
        doc,
        paramOrRef
      );

      if (ref) {
        const existingParameter = await prisma.apiSchemaParameter.findFirst({
          where: {
            schemaId: schema.id,
            ref,
          },
        });

        if (existingParameter) {
          await prisma.apiSchemaParameter.update({
            data: {
              paths: isApiSchemaPath(parent)
                ? {
                    connect: { id: parent.id },
                  }
                : undefined,
              operations: !isApiSchemaPath(parent)
                ? {
                    connect: { id: parent.id },
                  }
                : undefined,
            },
            where: {
              id: existingParameter.id,
            },
          });

          return existingParameter;
        }
      }

      const newParameter = await prisma.apiSchemaParameter.create({
        data: {
          ref,
          name: resolvedParam.name,
          location: mapParameterInToLocation(resolvedParam.in),
          required: resolvedParam.required,
          deprecated: resolvedParam.deprecated,
          allowEmptyValue: resolvedParam.allowEmptyValue,
          summary: "$ref" in paramOrRef ? paramOrRef.summary : undefined,
          description: resolvedParam.description,
          style: mapParameterStyle(resolvedParam.style),
          explode: resolvedParam.explode,
          validationSchema: resolvedParam.schema
            ? (resolveRef<OpenAPIV3_1.SchemaObject>(
                doc,
                resolvedParam.schema
              ) as any)
            : undefined,
          example: resolvedParam.example,
          schemaId: schema.id,
          paths: isApiSchemaPath(parent)
            ? {
                connect: { id: parent.id },
              }
            : undefined,
          operations: !isApiSchemaPath(parent)
            ? {
                connect: { id: parent.id },
              }
            : undefined,
        },
      });

      for (const [mediaType, refOrExample] of Object.entries(
        resolvedParam.examples ?? {}
      )) {
        await createSchemaExample(
          schema,
          doc,
          { parameterId: newParameter.id },
          mediaType,
          refOrExample
        );
      }

      return newParameter;
    })
  );
}

function mapHttpMethod(httpMethod: OpenAPIV3_1.HttpMethods): HTTPMethod {
  switch (httpMethod) {
    case "get":
      return "GET";
    case "post":
      return "POST";
    case "put":
      return "PUT";
    case "delete":
      return "DELETE";
    case "options":
      return "OPTIONS";
    case "head":
      return "HEAD";
    case "patch":
      return "PATCH";
    case "trace":
      return "TRACE";
    default:
      throw new Error(`Unsupported HTTP method: ${httpMethod}`);
  }
}

function mapParameterStyle(
  style?: string
): ApiSchemaParameterStyle | undefined {
  if (!style) {
    return;
  }

  switch (style) {
    case "matrix":
      return "MATRIX";
    case "form":
      return "FORM";
    case "simple":
      return "SIMPLE";
    case "label":
      return "LABEL";
    case "spaceDelimited":
      return "SPACE_DELIMITED";
    case "pipeDelimited":
      return "PIPE_DELIMITED";
    case "deepObject":
      return "DEEP_OBJECT";
    default:
      throw new Error(`Unsupported parameter style: ${style}`);
  }
}

function mapParameterInToLocation(inParam: string): ApiSchemaParameterLocation {
  switch (inParam) {
    case "query":
      return "QUERY";
    case "header":
      return "HEADER";
    case "path":
      return "PATH";
    case "cookie":
      return "COOKIE";
    default:
      throw new Error(`Unsupported parameter location: ${inParam}`);
  }
}

async function createSecurityRequirements(
  schema: ApiSchema,
  security: OpenAPIV3_1.Document["security"],
  attributes: { operationId?: string } = {}
) {
  if (!security) {
    return;
  }

  for (const securityRequirementObject of security) {
    const securitySchemeName = Object.keys(securityRequirementObject)[0];

    if (!securitySchemeName) {
      continue;
    }

    const securitySchemeScopes = securityRequirementObject[securitySchemeName];

    const securityScheme = await prisma.apiSchemaSecurityScheme.findFirst({
      where: {
        identifier: securitySchemeName,
        schemaId: schema.id,
      },
    });

    if (!securityScheme) {
      throw new Error(`Security scheme ${securitySchemeName} not found`);
    }

    await prisma.apiSchemaSecurityRequirement.create({
      data: {
        schema: !attributes.operationId
          ? {
              connect: {
                id: schema.id,
              },
            }
          : undefined,
        operation: attributes.operationId
          ? {
              connect: {
                id: attributes.operationId,
              },
            }
          : undefined,
        scopes: {
          connect: securitySchemeScopes.map((scope) => ({
            name_securitySchemeId: {
              name: scope,
              securitySchemeId: securityScheme.id,
            },
          })),
        },
        securityScheme: {
          connect: {
            identifier_schemaId: {
              schemaId: schema.id,
              identifier: securitySchemeName,
            },
          },
        },
      },
    });
  }
}

async function createSecuritySchemes(
  schema: ApiSchema,
  doc: OpenAPIV3_1.Document,
  securitySchemes?: Record<
    string,
    OpenAPIV3_1.SecuritySchemeObject | OpenAPIV3_1.ReferenceObject
  >
): Promise<Record<string, ApiSchemaSecurityScheme>> {
  if (!securitySchemes) {
    return {};
  }

  const result = {} as Record<string, ApiSchemaSecurityScheme>;

  for (const [identifier, schemeObject] of Object.entries(securitySchemes)) {
    const resolvedScheme = resolveRef<OpenAPIV3_1.SecuritySchemeObject>(
      doc,
      schemeObject
    );

    const heroExtensions = resolvedScheme[
      "x-apihero" as keyof OpenAPIV3_1.SecuritySchemeObject
    ] as ApiHeroExtensions["securityScheme"];

    switch (resolvedScheme.type) {
      case "apiKey": {
        const securityScheme = await prisma.apiSchemaSecurityScheme.create({
          data: {
            schemaId: schema.id,
            identifier,
            title: heroExtensions?.title,
            summary: heroExtensions?.summary,
            description: resolvedScheme.description,
            name: resolvedScheme.name,
            location: mapOpenApiSecuritySchemeLocation(resolvedScheme.in),
            type: mapOpenApiSecuritySchemeType(resolvedScheme.type),
          },
        });

        if (heroExtensions && heroExtensions.scopes) {
          await prisma.apiSchemaSecurityScope.createMany({
            data: Object.entries(heroExtensions.scopes).map(
              ([name, description]) => ({
                name,
                description,
                securitySchemeId: securityScheme.id,
              })
            ),
          });
        }

        result[identifier] = securityScheme;

        break;
      }
      case "http": {
        const securityScheme = await prisma.apiSchemaSecurityScheme.create({
          data: {
            schemaId: schema.id,
            identifier,
            title: heroExtensions?.title,
            summary: heroExtensions?.summary,
            description: resolvedScheme.description,
            httpScheme: resolvedScheme.scheme,
            bearerFormat: resolvedScheme.bearerFormat,
            type: mapOpenApiSecuritySchemeType(resolvedScheme.type),
          },
        });

        if (heroExtensions && heroExtensions.scopes) {
          await prisma.apiSchemaSecurityScope.createMany({
            data: Object.entries(heroExtensions.scopes).map(
              ([name, description]) => ({
                name,
                description,
                securitySchemeId: securityScheme.id,
              })
            ),
          });
        }

        result[identifier] = securityScheme;

        break;
      }
      case "openIdConnect": {
        result[identifier] = await prisma.apiSchemaSecurityScheme.create({
          data: {
            schemaId: schema.id,
            identifier,
            title: heroExtensions?.title,
            summary: heroExtensions?.summary,
            description: resolvedScheme.description,
            type: mapOpenApiSecuritySchemeType(resolvedScheme.type),
            openIdConnectUrl: resolvedScheme.openIdConnectUrl,
          },
        });
        break;
      }
      case "oauth2": {
        const oauthScheme = await prisma.apiSchemaSecurityScheme.create({
          data: {
            schemaId: schema.id,
            identifier,
            description: resolvedScheme.description,
            title: heroExtensions?.title,
            summary: heroExtensions?.summary,
            type: mapOpenApiSecuritySchemeType(resolvedScheme.type),
          },
        });

        if (resolvedScheme.flows.implicit) {
          const implicitFlow = resolvedScheme.flows.implicit;

          await prisma.apiSchemaSecurityOAuthFlow.create({
            data: {
              type: "IMPLICIT",
              authorizationUrl: implicitFlow.authorizationUrl,
              refreshUrl: implicitFlow.refreshUrl,
              securitySchemeId: oauthScheme.id,
              scopes: {
                connectOrCreate: Object.entries(implicitFlow.scopes).map(
                  ([scopeName, scopeDesc]) => ({
                    where: {
                      name_securitySchemeId: {
                        name: scopeName,
                        securitySchemeId: oauthScheme.id,
                      },
                    },
                    create: {
                      name: scopeName,
                      description: scopeDesc,
                      securitySchemeId: oauthScheme.id,
                    },
                  })
                ),
              },
            },
          });
        }

        if (resolvedScheme.flows.authorizationCode) {
          const flow = resolvedScheme.flows.authorizationCode;

          await prisma.apiSchemaSecurityOAuthFlow.create({
            data: {
              type: "AUTHORIZATION_CODE",
              authorizationUrl: flow.authorizationUrl,
              tokenUrl: flow.tokenUrl,
              refreshUrl: flow.refreshUrl,
              securitySchemeId: oauthScheme.id,
              scopes: {
                connectOrCreate: Object.entries(flow.scopes).map(
                  ([scopeName, scopeDesc]) => ({
                    where: {
                      name_securitySchemeId: {
                        name: scopeName,
                        securitySchemeId: oauthScheme.id,
                      },
                    },
                    create: {
                      name: scopeName,
                      description: scopeDesc,
                      securitySchemeId: oauthScheme.id,
                    },
                  })
                ),
              },
            },
          });
        }

        if (resolvedScheme.flows.clientCredentials) {
          const flow = resolvedScheme.flows.clientCredentials;

          await prisma.apiSchemaSecurityOAuthFlow.create({
            data: {
              type: "CLIENT_CREDENTIALS",
              tokenUrl: flow.tokenUrl,
              refreshUrl: flow.refreshUrl,
              securitySchemeId: oauthScheme.id,
              scopes: {
                connectOrCreate: Object.entries(flow.scopes).map(
                  ([scopeName, scopeDesc]) => ({
                    where: {
                      name_securitySchemeId: {
                        name: scopeName,
                        securitySchemeId: oauthScheme.id,
                      },
                    },
                    create: {
                      name: scopeName,
                      description: scopeDesc,
                      securitySchemeId: oauthScheme.id,
                    },
                  })
                ),
              },
            },
          });
        }

        if (resolvedScheme.flows.password) {
          const flow = resolvedScheme.flows.password;

          await prisma.apiSchemaSecurityOAuthFlow.create({
            data: {
              type: "PASSWORD",
              tokenUrl: flow.tokenUrl,
              refreshUrl: flow.refreshUrl,
              securitySchemeId: oauthScheme.id,
              scopes: {
                connectOrCreate: Object.entries(flow.scopes).map(
                  ([scopeName, scopeDesc]) => ({
                    where: {
                      name_securitySchemeId: {
                        name: scopeName,
                        securitySchemeId: oauthScheme.id,
                      },
                    },
                    create: {
                      name: scopeName,
                      description: scopeDesc,
                      securitySchemeId: oauthScheme.id,
                    },
                  })
                ),
              },
            },
          });
        }

        const heroFlowExtensions = resolvedScheme.flows[
          "x-apihero" as keyof OpenAPIV3_1.OAuth2SecurityScheme["flows"]
        ] as ApiHeroExtensions["oauthFlows"];

        if (heroFlowExtensions && heroFlowExtensions.deviceAuthorization) {
          const flow = heroFlowExtensions.deviceAuthorization;

          await prisma.apiSchemaSecurityOAuthFlow.create({
            data: {
              type: "DEVICE_CODE",
              tokenUrl: flow.tokenUrl,
              deviceAuthorizationUrl: flow.deviceAuthorizationUrl,
              securitySchemeId: oauthScheme.id,
              scopes: {
                connectOrCreate: Object.entries(flow.scopes).map(
                  ([scopeName, scopeDesc]) => ({
                    where: {
                      name_securitySchemeId: {
                        name: scopeName,
                        securitySchemeId: oauthScheme.id,
                      },
                    },
                    create: {
                      name: scopeName,
                      description: scopeDesc,
                      securitySchemeId: oauthScheme.id,
                    },
                  })
                ),
              },
            },
          });
        }

        result[identifier] = oauthScheme;
        break;
      }
    }
  }

  return result;
}

function mapOpenApiSecuritySchemeLocation(
  inLocation: OpenAPIV3_1.ApiKeySecurityScheme["in"]
): ApiSchemaSecuritySchemeLocation {
  switch (inLocation) {
    case "query":
      return "QUERY";
    case "header":
      return "HEADER";
    case "cookie":
      return "COOKIE";
    default:
      return "QUERY";
  }
}

function mapOpenApiSecuritySchemeType(
  type: OpenAPIV3_1.SecuritySchemeObject["type"]
): ApiSchemaSecuritySchemeType {
  switch (type) {
    case "apiKey":
      return "APIKEY";
    case "http":
      return "HTTP";
    case "oauth2":
      return "OAUTH2";
    case "openIdConnect":
      return "OPENIDCONNECT";
  }
}

const ESCAPED_REF_SLASH = /~1/g;
const ESCAPED_REF_TILDE = /~0/g;

function resolveRef<T>(
  doc: OpenAPI.Document,
  refOrObject: OpenAPIV3_1.ReferenceObject | T
): T {
  if ("$ref" in refOrObject) {
    // Fetch the paths to the definitions, this converts:
    // "#/components/schemas/Form" to ["components", "schemas", "Form"]
    const paths = refOrObject.$ref
      .replace(/^#/g, "")
      .split("/")
      .filter((item) => item);

    // Try to find the reference by walking down the path,
    // if we cannot find it, then we throw an error.
    let result: any = doc;

    paths.forEach((path) => {
      const decodedPath = decodeURIComponent(
        path.replace(ESCAPED_REF_SLASH, "/").replace(ESCAPED_REF_TILDE, "~")
      );
      // eslint-disable-next-line no-prototype-builtins
      if (result.hasOwnProperty(decodedPath)) {
        result = result[decodedPath];
      } else {
        throw new Error(`Could not find reference: "${refOrObject.$ref}"`);
      }
    });

    return result as T;
  }

  return refOrObject as T;
}

async function createSchemaServers(
  servers?: OpenAPIV3_1.ServerObject[],
  serverAttributes: Partial<
    Pick<ApiSchemaServer, "operationId" | "pathId" | "schemaId">
  > = {}
): Promise<ApiSchemaServer[]> {
  if (!servers) {
    return [];
  }

  return Promise.all(
    servers.map(async (server) => {
      return await prisma.apiSchemaServer.create({
        data: {
          url: server.url,
          description: server.description,
          ...serverAttributes,
        },
      });
    })
  );
}

async function createSchemaTags(
  schema: ApiSchema,
  tags?: OpenAPIV3.TagObject[]
): Promise<Record<string, ApiSchemaTag>> {
  if (!tags) {
    return {} as Record<string, ApiSchemaTag>;
  }

  const result = {} as Record<string, ApiSchemaTag>;

  for (const tag of tags) {
    result[tag.name] = await prisma.apiSchemaTag.create({
      data: {
        name: tag.name,
        description: tag.description,
        schemaId: schema.id,
      },
    });
  }

  return result;
}

async function createIntegrationSchemaV3(
  integration: Integration,
  doc: OpenAPIV3.Document
) {
  return createIntegrationSchemaV3_1(integration, upgradeV3toV3_1(doc));
}

async function createIntegrationSchemaV2(
  integration: Integration,
  doc: OpenAPIV2.Document
) {}

function upgradeV3toV3_1(doc: OpenAPIV3.Document): OpenAPIV3_1.Document {
  return doc as OpenAPIV3_1.Document;
}
