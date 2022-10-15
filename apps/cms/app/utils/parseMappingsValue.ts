import type { Mapping } from "@apihero/openapi-spec-generator/lib/generate";
import type { Prisma } from "@prisma/client";

export function parseMappingsValue(value: Prisma.JsonValue): Mapping[] {
  if (typeof value === "string") {
    return JSON.parse(value);
  }

  if (!value) {
    return [];
  }

  return value as Mapping[];
}
