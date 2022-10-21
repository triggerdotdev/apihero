-- AlterTable
ALTER TABLE "HttpRequestLog" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "HttpRequestLog_id_seq";
