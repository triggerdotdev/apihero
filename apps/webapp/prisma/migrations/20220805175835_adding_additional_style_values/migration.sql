-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApiSchemaParameterStyle" ADD VALUE 'LABEL';
ALTER TYPE "ApiSchemaParameterStyle" ADD VALUE 'SPACE_DELIMITED';
ALTER TYPE "ApiSchemaParameterStyle" ADD VALUE 'PIPE_DELIMITED';
ALTER TYPE "ApiSchemaParameterStyle" ADD VALUE 'DEEP_OBJECT';