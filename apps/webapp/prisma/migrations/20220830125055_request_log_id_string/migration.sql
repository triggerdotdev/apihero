/*
  Warnings:

  - The primary key for the `HttpRequestLog` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "HttpRequestLog" DROP CONSTRAINT "HttpRequestLog_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "HttpRequestLog_pkey" PRIMARY KEY ("id");
