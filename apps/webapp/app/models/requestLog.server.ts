import type {
  HttpEndpoint,
  HTTPMethod,
  HttpRequestLog,
} from "@apihero/database";
import { prisma } from "@apihero/database";
import { dateFromDateString } from "~/libraries/common";

export type CreateRequestLog = {
  id: string;
  method: HTTPMethod;
  statusCode: number;
  baseUrl: string;
  path: string;
  isCacheHit: boolean;
  integrationSlug: string;
  operationId: string;
  projectKey: string;
  clientAuthenticationId?: string;
  search?: string;
  requestBody?: any;
  requestHeaders?: Record<string, string>;
  responseBody?: any;
  responseHeaders?: Record<string, string>;
  responseSize?: number;
  params?: any;
  mappings?: any;
  requestDuration?: number;
  gatewayDuration?: number;
};

export async function createRequestLog(requestLog: CreateRequestLog) {
  const operation = await prisma.apiSchemaOperation.findFirst({
    where: {
      operationId: requestLog.operationId,
      schema: {
        integration: {
          slug: requestLog.integrationSlug,
        },
      },
    },
    include: {
      schema: {
        include: {
          integration: true,
        },
      },
    },
  });

  if (!operation) {
    throw new Error("Operation not found");
  }

  const client = await prisma.httpClient.findUnique({
    where: {
      projectId_integrationId: {
        projectId: requestLog.projectKey,
        integrationId: operation.schema.integration.id,
      },
    },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  return prisma.httpRequestLog.create({
    data: {
      id: requestLog.id,
      method: requestLog.method,
      statusCode: requestLog.statusCode,
      baseUrl: requestLog.baseUrl,
      path: requestLog.path,
      isCacheHit: requestLog.isCacheHit,
      search: requestLog.search,
      requestBody: requestLog.requestBody ?? undefined,
      requestHeaders: requestLog.requestHeaders ?? undefined,
      responseBody: requestLog.responseBody ?? undefined,
      responseHeaders: requestLog.responseHeaders ?? undefined,
      responseSize: requestLog.responseSize,
      params: requestLog.params ?? undefined,
      mappings: requestLog.mappings ?? undefined,
      requestDuration: requestLog.requestDuration,
      gatewayDuration: requestLog.gatewayDuration,
      endpoint: {
        connectOrCreate: {
          where: {
            clientId_operationId: {
              clientId: client.id,
              operationId: operation.id,
            },
          },
          create: {
            clientId: client.id,
            operationId: operation.id,
          },
        },
      },
    },
  });
}

export async function getLogs({
  endpointId,
  startDate,
  endDate,
  cursor,
  direction,
}: {
  startDate: string;
  endDate: string;
  cursor?: HttpRequestLog["id"];
  endpointId: HttpEndpoint["id"];
  direction?: "previous" | "next";
}) {
  const start = dateFromDateString(startDate);
  const end = dateFromDateString(endDate);
  end.setHours(23, 59, 59, 999);

  const pageSize = 50;
  if (cursor) {
    const takeMultiplier = direction === "previous" ? -1 : 1;
    const logs = await prisma.httpRequestLog.findMany({
      take: takeMultiplier * (pageSize + 1),
      skip: 1,
      cursor: {
        id: cursor,
      },
      where: { endpointId, createdAt: { gte: start, lte: end } },
      orderBy: {
        id: "desc",
      },
    });
    const hasMore = logs.length > pageSize;
    if (!direction || direction === "next") {
      return {
        logs: logs.length > 1 ? logs.slice(0, -1) : logs,
        cursors: {
          next: hasMore ? logs[logs.length - 2]?.id : undefined,
          previous: logs[0]?.id,
        },
      };
    } else {
      return {
        logs: hasMore ? logs.slice(1) : logs.slice(0, pageSize),
        cursors: {
          next: logs[logs.length - 1]?.id,
          previous: hasMore ? logs[1]?.id : undefined,
        },
      };
    }
  } else {
    const logs_1 = await prisma.httpRequestLog.findMany({
      take: pageSize + 1,
      where: { endpointId, createdAt: { gte: start, lte: end } },
      orderBy: {
        createdAt: "desc",
      },
    });
    const hasMore_1 = logs_1.length > pageSize;
    return {
      logs: logs_1.slice(0, pageSize),
      cursors: {
        next: hasMore_1 ? logs_1[pageSize - 1]?.id : undefined,
      },
    };
  }
}

export async function getLog(logId: string) {
  return prisma.httpRequestLog.findUnique({
    where: { id: logId },
  });
}

export async function getRequestLogbyId(id: string) {
  return prisma.httpRequestLog.findUnique({
    where: { id },
    include: {
      endpoint: {
        include: {
          operation: true,
          client: {
            include: {
              integration: true,
              project: {
                include: {
                  workspace: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
