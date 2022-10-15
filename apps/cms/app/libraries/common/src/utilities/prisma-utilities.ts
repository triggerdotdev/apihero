import type { Prisma } from "@prisma/client";
import { z } from "zod";

const StringRecordSchema = z.record(z.string());
type StringRecord = z.infer<typeof StringRecordSchema>;

export function isStringRecord(value: Prisma.JsonValue): value is StringRecord {
  return StringRecordSchema.safeParse(value).success;
}

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;

export type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

export function isJson(value: Prisma.JsonValue): value is Json {
  return jsonSchema.safeParse(value).success;
}

export type JsonObject = { [key: string]: Json };
const jsonObjectSchema = z.record(jsonSchema);
export function isJsonObject(value: Prisma.JsonValue): value is JsonObject {
  return jsonObjectSchema.safeParse(value).success;
}
