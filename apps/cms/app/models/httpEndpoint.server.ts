import type { HTTPMethod } from "@prisma/client";
import { prisma } from "~/db.server";

export function getEndpoint(
  clientId: string,
  method: HTTPMethod,
  operationId: string
) {
  return prisma.httpEndpoint.findFirst({
    where: {
      clientId: clientId,
      operation: { method: method, operationId },
    },
    include: {
      operation: {
        include: { parameters: true, path: true },
      },
    },
  });
}

export function isHttpMethod(str: string): str is HTTPMethod {
  return (
    str === "GET" ||
    str === "HEAD" ||
    str === "POST" ||
    str === "PUT" ||
    str === "PATCH" ||
    str === "OPTIONS" ||
    str === "DELETE" ||
    str === "TRACE"
  );
}

export type EndpointStats = {
  successRatio24Hr?: number;
  avgDuration?: number;
  errorCount?: number;
};

export async function getStatsById(id: string): Promise<EndpointStats> {
  const last24HrSuccessCount = await prisma.httpRequestLog.count({
    where: {
      endpointId: id,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      statusCode: {
        in: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226],
      },
    },
  });

  const last24HrFailureCount = await prisma.httpRequestLog.count({
    where: {
      endpointId: id,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      statusCode: {
        notIn: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226],
      },
    },
  });

  const last24HrCount = last24HrSuccessCount + last24HrFailureCount;
  const successRatio24Hr = last24HrCount
    ? (last24HrSuccessCount / last24HrCount) * 100
    : undefined;

  const aggregations = await prisma.httpRequestLog.aggregate({
    where: {
      endpointId: id,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      statusCode: {
        in: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226],
      },
    },
    _avg: {
      requestDuration: true,
    },
  });

  return {
    successRatio24Hr,
    avgDuration: aggregations._avg.requestDuration ?? undefined,
    errorCount: last24HrFailureCount,
  };
}
