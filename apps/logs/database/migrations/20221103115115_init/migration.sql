-- Install TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- CreateEnum
CREATE TYPE "HTTPMethod" AS ENUM ('GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE', 'TRACE');

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "method" "HTTPMethod" NOT NULL DEFAULT 'GET',
    "status_code" INTEGER NOT NULL,
    "base_url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "search" TEXT NOT NULL DEFAULT '',
    "request_body" JSONB,
    "request_headers" JSONB,
    "response_body" JSONB,
    "response_headers" JSONB,
    "is_cache_hit" BOOLEAN NOT NULL,
    "response_size" INTEGER NOT NULL DEFAULT 0,
    "request_duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gateway_duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Log_id_created_at_key" ON "Log"("id", "created_at");

-- CreateHyperTable
SELECT create_hypertable('"Log"', 'created_at');