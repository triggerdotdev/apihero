import { generateClientFiles } from "@apihero/openapi-spec-generator";
import type { OpenAPIV3_1 } from "openapi-types";
import invariant from "tiny-invariant";
import {
  findOperationById,
  findSchemaById,
  generateSpecFromSchema,
} from "./apiSchema.server";

export async function generateFilesForSchema(
  schemaId: string,
  version: string
) {
  const schema = await findSchemaById(schemaId);

  invariant(schema, "schema must be present");

  const spec = await generateSpecFromSchema(schemaId);

  if (!spec) {
    return;
  }

  const { files, mappings } = generateClientFiles(
    spec,
    schema.integration.slug,
    {
      additionalData: { clientId: schema.integration.slug, version },
      generation: { inferRequestBodyParamName: true, noParamsType: "void" },
    }
  );

  return { spec, files, mappings };
}

export async function generateCodeForOperation(
  operationId: string,
  spec: OpenAPIV3_1.Document
) {
  const operation = await findOperationById(operationId);

  if (!operation) {
    return;
  }

  const { files } = generateClientFiles(spec, operation.id, {
    generation: { inferRequestBodyParamName: true, noParamsType: "void" },
  });

  return Object.entries(files)
    .map(
      ([fileName, fileContent]) => `${fileNameBanner(fileName)}${fileContent}`
    )
    .join("\n\n");
}

function fileNameBanner(fileName: string): string {
  return `// File: ${fileName}\n\n`;
}
