-- AlterTable
ALTER TABLE "ApiSchemaRequestBodyContent" ALTER COLUMN "validationSchema" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ApiSchemaResponseBodyContent" ALTER COLUMN "validationSchema" DROP NOT NULL;
