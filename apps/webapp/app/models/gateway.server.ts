import { prisma } from "~/db.server";

export async function findOperationData(
  integrationId: string,
  operationId: string
) {
  const integration = await prisma.integration.findFirst({
    where: { slug: integrationId },
    include: {
      currentSchema: {
        select: {
          id: true,
          securityOptional: true,
          servers: true,
        },
      },
    },
  });

  if (!integration) {
    return;
  }

  const schema = integration.currentSchema;

  if (!schema) {
    return;
  }

  const operation = await prisma.apiSchemaOperation.findFirst({
    where: {
      schemaId: schema.id,
      operationId,
    },
    include: {
      path: true,
      parameters: true,
      requestBody: true,
      responseBodies: {
        include: {
          contents: true,
          headers: true,
        },
      },
      securityRequirements: {
        include: {
          securityScheme: true,
          scopes: true,
        },
      },
    },
  });

  return { schema, operation };
}

export async function findEndpoint(clientId: string, operationId: string) {
  return prisma.httpEndpoint.findFirst({
    where: {
      clientId,
      operationId,
    },
  });
}

export async function syncIntegrationsSettingsWithGateway({
  workspaceSlug,
  projectSlug,
  clientId,
}: {
  workspaceSlug: string;
  projectSlug: string;
  clientId: string;
}) {
  const client = await prisma.httpClient.findFirst({
    where: {
      id: clientId,
      project: { slug: projectSlug, workspace: { slug: workspaceSlug } },
    },
    include: {
      authentications: {
        include: {
          securityScheme: {
            select: {
              identifier: true,
              isEnabled: true,
              type: true,
              name: true,
              location: true,
              httpScheme: true,
              bearerFormat: true,
            },
          },
        },
      },
      integration: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!client) {
    throw new Error(`Client not found: ${clientId}`);
  }

  const data = {
    caching: {
      enabled: client.cacheEnabled,
      ttl: client.cacheTtl,
    },
    authentication: client.authentications.map((auth) => ({
      id: auth.securityScheme.identifier,
      type: auth.securityScheme.type,
      httpScheme: auth.securityScheme.httpScheme,
      username: auth.username ?? undefined,
      password: auth.password ?? undefined,
    })),
  };

  const url = `${process.env.GATEWAY_ORIGIN}/project/${client.projectId}/api/${client.integration.slug}/settings`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GATEWAY_API_PRIVATE_KEY}`,
      "Content-Type": "application/json",
      Accept: "*/*",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Gateway: failed to update project integration settings: ${response.status} ${response.statusText}`
    );
  }

  const body = await response.json();
  console.log(`Gateway: updated project integration settings url`);

  return body;
}
