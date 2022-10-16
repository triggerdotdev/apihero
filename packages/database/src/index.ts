import { Prisma } from "@prisma/client";

export * from "./client";

export type { PrismaClient } from "./client";

//generic Prisma types
type JsonObject = Prisma.JsonObject;
export type { JsonObject };

//schema types
export type { User } from "@prisma/client";
export type { Workspace } from "@prisma/client";
export type { Project } from "@prisma/client";
export type { HttpClient } from "@prisma/client";
