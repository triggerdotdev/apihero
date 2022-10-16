import { prisma } from "@apihero/database";

export async function findSecurityRequirementsByOperationId(
  operationId: string
) {
  return prisma.apiSchemaSecurityRequirement.findMany({
    where: {
      operationId,
    },
    include: {
      scopes: true,
      securityScheme: true,
    },
  });
}

export async function getSecurityRequirementsForIntegration(
  integrationId: string
) {
  const latestSchema = await prisma.apiSchema.findFirst({
    where: { integrationId },
    orderBy: { version: "desc" },
  });

  if (!latestSchema) {
    return [];
  }

  return prisma.apiSchemaSecurityScheme.findMany({
    where: {
      schemaId: latestSchema.id,
    },
  });
}
