import type { ActionFunction, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { findOperationData } from "~/models/gateway.server";
import { getProjectByKey } from "~/models/project.server";
import type { Mapping } from "@apihero/openapi-spec-generator/lib/generate";
import { createRequestLog } from "~/models/requestLog.server";
import cuid from "cuid";
import type {
  ApiSchemaParameter,
  ApiSchemaResponseBodyContent,
  Prisma,
} from ".prisma/client";
import fetchHero from "@jsonhero/fetch-hero";

const heroFetch = fetchHero(fetch, {
  httpCache: {
    enabled: true,
    namespace: "apihero",
    store: process.env.REDIS_URL,
    storeOptions: { family: 6 },
    options: { shared: true },
  },
});

type ProjectByKey = Awaited<ReturnType<typeof getProjectByKey>>;

// Return CORS headers for the given project
// Allow all headers
export function loader({ request }: LoaderArgs) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

export const action: ActionFunction = async ({ request }) => {
  const gatewayStartTime = performance.now();

  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return json(
      {
        message:
          "Did not include the Authorization header with your project key",
      },
      { status: 401 }
    );
  }

  const [, projectKey] = authorization.split(" ");

  const { endpoint, params } = await request.json();

  const project = await getProjectByKey(projectKey, endpoint.clientId);

  if (!project || project.httpClients.length === 0) {
    return json(
      {
        message: "Could not find a project with that key",
      },
      { status: 401 }
    );
  }

  const httpClient = project.httpClients[0];

  const operationData = await findOperationData(endpoint.clientId, endpoint.id);

  if (!operationData) {
    return json(
      {
        message: `Could not find an operation with id ${endpoint.clientId}/${endpoint.id}`,
      },
      { status: 400 }
    );
  }

  const { schema, operation } = operationData;

  if (!operation) {
    return json(
      {
        message: `Could not find an operation data with id ${endpoint.clientId}/${endpoint.id}`,
      },
      { status: 400 }
    );
  }

  const clientAuthentication = findClientAuthenticationForOperation(
    httpClient,
    operation
  );

  const url = buildRequestUrl(schema, operation, params);
  const headers = buildRequestHeaders(operation, params, clientAuthentication);
  const body = buildRequestBody(schema, operation, params);

  if (body) {
    headers["Content-Type"] = "application/json; charset=utf-8";
  }

  const requestStartTime = performance.now();

  const response = await heroFetch(url.href, {
    headers,
    method: operation.method,
    body: body ? JSON.stringify(body) : undefined,
    fh: {
      httpCache: {
        bypass: httpClient.cacheEnabled
          ? { ttl: httpClient.cacheTtl }
          : undefined,
        namespace: `${httpClient.id}`,
      },
    },
  });

  const endTime = performance.now();

  const requestDuration = endTime - requestStartTime;
  const gatewayDuration = endTime - gatewayStartTime;

  const requestId = cuid();

  const responseHeaders = Object.fromEntries(response.headers);

  const responseBody = await response.json();

  await createRequestLog({
    id: requestId,
    method: operation.method,
    statusCode: response.status,
    baseUrl: url.origin,
    path: url.pathname,
    search: url.search,
    isCacheHit: responseHeaders["x-fh-cache-status"] === "HIT",
    operationId: operation.operationId,
    integrationSlug: endpoint.clientId,
    clientAuthenticationId: clientAuthentication?.id,
    requestBody: body,
    requestHeaders: filterRequestHeaders(headers),
    responseBody,
    responseHeaders,
    responseSize: extractResponseSize(response, responseBody),
    params,
    mappings: operation.mappings,
    requestDuration,
    gatewayDuration,
    projectKey,
  });

  const debugUri = `${process.env.APP_ORIGIN}/workspaces/${
    project.workspace.slug
  }/projects/${project.slug}/${
    endpoint.clientId
  }/${operation.method.toUpperCase()}/${operation.operationId}`;

  const strippedResponseHeaders = stripResponseHeaders(responseHeaders);

  return json(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...strippedResponseHeaders,
      "x-apihero-request-id": requestId,
      "x-apihero-debug-uri": debugUri,
    },
  });
};

// Strip out the following headers that are not allowed to be sent to the client:
function stripResponseHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === "connection") continue;
    if (key.toLowerCase() === "content-encoding") continue;
    if (key.toLowerCase() === "content-security-policy") continue;
    if (key.toLowerCase() === "date") continue;
    if (key.toLowerCase() === "server") continue;
    if (key.toLowerCase() === "strict-transport-security") continue;
    if (key.toLowerCase() === "transfer-encoding") continue;
    if (key.toLowerCase() === "content-length") continue;

    // FIXME: For some reason, including this location header causes the response to be empty
    if (key.toLowerCase() === "location") continue;

    result[key] = value;
  }

  return result;
}

type FindOperationData = NonNullable<
  Awaited<ReturnType<typeof findOperationData>>
>;

type ResponseBodiesData = NonNullable<
  FindOperationData["operation"]
>["responseBodies"];

function findResponseBodyForStatusCode(
  responseBodies: ResponseBodiesData,
  statusCode: number
): ResponseBodiesData[0] | undefined {
  return responseBodies.find((responseBody) => {
    return statusCodeMatches(responseBody.statusCode, statusCode);
  });
}

function findResponseBodyContent(
  contents: ApiSchemaResponseBodyContent[],
  contentType: string | null
): ApiSchemaResponseBodyContent | undefined {
  if (!contentType) {
    return;
  }

  // Sort the contents by the mediaTypeRangeMatchScore, descending.
  // This will give us the most specific match first.
  const sortedContents = contents.sort((a, b) => {
    return (
      mediaTypeRangeMatchScore(a.mediaTypeRange, contentType) -
      mediaTypeRangeMatchScore(b.mediaTypeRange, contentType)
    );
  });

  return sortedContents[0];
}

function filterRequestHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const filteredHeaders: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === "authorization") {
      filteredHeaders[key] = obfuscateAuthorizationHeader(value);
    } else {
      filteredHeaders[key] = value;
    }
  }

  return filteredHeaders;
}

// Should replace the authorization header value with a string that is the same length but obfuscated
function obfuscateAuthorizationHeader(value: string) {
  const [type, token] = value.split(" ");

  if (type && token) {
    return `${type} ${"*".repeat(12)}`;
  }

  return "*".repeat(12);
}

// mediaTypeRange range can be something like "application/json" or even "application/*"
// contentType can be "application/json" or "application/json; charset=utf-8"
// When mediaTypeRange is "*/*", then return a 1
// When there is a match between mediaTypeRange and contentType, but mediaTypeRange is "application/*", return 10
// When there is a match between mediaTypeRange and contentType, and mediaTypeRange is "application/json", return 100
// When there is no match between mediaTypeRange and contentType, return 0
function mediaTypeRangeMatchScore(
  mediaTypeRange: string,
  contentType: string
): 10 | 100 | 1 | 0 {
  if (mediaTypeRange === "*/*") {
    return 1;
  }

  if (/^([a-zA-Z\/]+)\*$/.test(mediaTypeRange)) {
    const mediaTypeRangeMatches = mediaTypeRange.match(/^([a-zA-Z\/]+)\*$/)!;

    if (contentType.startsWith(mediaTypeRangeMatches[1])) {
      return 10;
    }
  }

  if (contentType.startsWith(mediaTypeRange)) {
    return 100;
  }

  return 0;
}

function statusCodeMatches(
  statusCodePattern: "2XX" | "3XX" | "4XX" | "5XX" | string | null,
  statusCode: number
) {
  if (statusCodePattern === null) {
    return false;
  }

  if (statusCodePattern === "2XX") {
    return statusCode >= 200 && statusCode < 300;
  } else if (statusCodePattern === "3XX") {
    return statusCode >= 300 && statusCode < 400;
  } else if (statusCodePattern === "4XX") {
    return statusCode >= 400 && statusCode < 500;
  } else if (statusCodePattern === "5XX") {
    return statusCode >= 500 && statusCode < 600;
  } else {
    return statusCode === Number(statusCodePattern);
  }
}

function buildRequestUrl(
  schema: FindOperationData["schema"],
  operation: NonNullable<FindOperationData["operation"]>,
  params: any
) {
  const baseUrl = buildRequestBaseUrl(schema);
  const path = buildRequestPath(operation, params);

  const url = new URL(path, baseUrl);

  const searchParams = buildRequestSearchParams(operation, params);

  if (searchParams) {
    url.search = searchParams.toString();
  }

  return url;
}

function buildRequestBaseUrl(schema: FindOperationData["schema"]) {
  return schema.servers[0].url;
}

function buildRequestPath(
  operation: NonNullable<FindOperationData["operation"]>,
  params: any
) {
  return operation.parameters
    .filter((param) => param.location === "PATH")
    .reduce((path, param) => {
      const mappedName = getMappedParamName(
        param.name,
        operation.mappings as unknown as Mapping[]
      );

      const value = params[mappedName];

      if (value === undefined) {
        throw new Error(`Missing parameter ${param.name} [${mappedName}]`);
      }

      return path.replace(`{${param.name}}`, value);
    }, operation.path.path);
}

function buildRequestSearchParams(
  operation: NonNullable<FindOperationData["operation"]>,
  params: any
): URLSearchParams | undefined {
  const queryParameters = operation.parameters.filter(
    (param) => param.location === "QUERY"
  );

  if (queryParameters.length === 0) {
    return;
  }

  const result = new URLSearchParams();

  for (const queryParam of queryParameters) {
    const mappedName = getMappedParamName(
      queryParam.name,
      operation.mappings as unknown as Mapping[]
    );

    if (params[mappedName]) {
      insertParameterIntoQuery(queryParam, params[mappedName], result);
    }
  }

  return result;
}

function insertParameterIntoQuery(
  param: ApiSchemaParameter,
  value: any,
  searchParams: URLSearchParams
) {
  switch (param.style) {
    case "FORM": {
      if (param.explode) {
        if (Array.isArray(value)) {
          for (const item of value) {
            searchParams.append(param.name, item);
          }
        } else {
          searchParams.append(param.name, value);
        }
      } else {
        if (Array.isArray(value)) {
          searchParams.append(param.name, value.join(","));
        } else {
          searchParams.append(param.name, value);
        }
      }

      break;
    }
    case "SPACE_DELIMITED": {
      if (Array.isArray(value)) {
        searchParams.append(param.name, value.join(" "));
      }

      searchParams.append(param.name, value);

      break;
    }
    case "PIPE_DELIMITED": {
      if (Array.isArray(value)) {
        searchParams.append(param.name, value.join("|"));
      }

      searchParams.append(param.name, value);

      return value;
    }
    case "DEEP_OBJECT": {
      if (typeof value === "object") {
        searchParams.set(param.name, JSON.stringify(value));
      }

      searchParams.append(param.name, value);

      break;
    }
    default: {
      searchParams.append(param.name, value);
    }
  }
}

function buildRequestHeaders(
  operation: NonNullable<FindOperationData["operation"]>,
  params: any,
  clientAuthentication: ClientAuthenticationForOperation
): Record<string, string> {
  if (
    clientAuthentication &&
    clientAuthentication.securityScheme.type === "HTTP"
  ) {
    return {
      "User-Agent": "APIHeroGateway/1.0-beta",
      Accept: "*/*",
      ...buildHttpAuthenticationRequestHeaders(clientAuthentication),
    };
  }
  return {};
}

function buildHttpAuthenticationRequestHeaders(
  clientAuthentication: NonNullable<ClientAuthenticationForOperation>
): Record<string, string> {
  if (!clientAuthentication.username && !clientAuthentication.password) {
    return {};
  }

  if (clientAuthentication.securityScheme.httpScheme === "basic") {
    return {
      Authorization: `Basic ${Buffer.from(
        `${clientAuthentication.username}:${clientAuthentication.password}`
      ).toString("base64")}`,
    };
  }

  if (
    clientAuthentication.securityScheme.httpScheme === "bearer" &&
    clientAuthentication.password
  ) {
    return {
      Authorization: `Bearer ${clientAuthentication.password}`,
    };
  }

  return {};
}

function buildRequestBody(
  schema: FindOperationData["schema"],
  operation: NonNullable<FindOperationData["operation"]>,
  params: any
): Prisma.JsonValue | null {
  const mappedRequestBodyName = getMappedRequestBodyName(
    "payload",
    operation.mappings as unknown as Mapping[]
  );

  const requestBody = params[mappedRequestBodyName];

  if (requestBody === undefined || requestBody === null) {
    return null;
  }

  return requestBody;
}

function getMappedRequestBodyName(
  defaultName: string,
  mappings: Mapping[]
): string {
  if (!mappings) {
    return defaultName;
  }

  const mapping = mappings.find((m) => m.type === "requestBody");

  if (!mapping) {
    return defaultName;
  }

  return mapping.mappedName;
}

function getMappedParamName(name: string, mappings: Mapping[]): string {
  if (!mappings) {
    return name;
  }

  const mapping = mappings.find(
    (m) => m.type === "parameter" && m.name === name
  );

  if (!mapping) {
    return name;
  }

  return mapping.mappedName;
}

type ClientAuthenticationForOperation = ReturnType<
  typeof findClientAuthenticationForOperation
>;

function findClientAuthenticationForOperation(
  client: NonNullable<ProjectByKey>["httpClients"][0],
  operation: NonNullable<FindOperationData["operation"]>
) {
  const operationAuthentications = operation.securityRequirements
    .map((securityRequirement) =>
      client.authentications.find(
        (auth) =>
          auth.securityScheme.id === securityRequirement.securityScheme.id
      )
    )
    .filter(Boolean);

  if (operationAuthentications.length === 0) {
    return;
  }

  return operationAuthentications[0];
}

// Remove content length and transfer encoding headers from the response headers
function stripInvalidHeaders(headers: Headers): Headers {
  const result = new Headers();

  for (const [name, value] of headers.entries()) {
    if (
      name.toLowerCase() !== "content-length" &&
      name.toLowerCase() !== "transfer-encoding"
    ) {
      result.append(name, value);

      continue;
    }
  }

  return result;
}

function extractResponseSize(
  response: Response | undefined,
  responseBody?: any
): number {
  if (!response) {
    return 0;
  }

  if (response.headers.has("Content-Length")) {
    return Number(response.headers.get("Content-Length"));
  }

  if (responseBody) {
    return JSON.stringify(responseBody).length;
  }

  return 0;
}
