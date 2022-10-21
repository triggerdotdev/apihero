-- CreateEnum
CREATE TYPE "HTTPMethod" AS ENUM ('GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE');

-- AlterTable
ALTER TABLE "Endpoint" ADD COLUMN     "method" "HTTPMethod" NOT NULL DEFAULT E'GET';
