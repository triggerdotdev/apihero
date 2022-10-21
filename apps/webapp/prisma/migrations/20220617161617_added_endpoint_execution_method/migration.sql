-- AlterTable
ALTER TABLE "EndpointExecution" ADD COLUMN     "method" "HTTPMethod" NOT NULL DEFAULT E'GET';
