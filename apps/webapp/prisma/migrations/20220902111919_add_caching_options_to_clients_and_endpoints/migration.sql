-- AlterTable
ALTER TABLE "HttpClient" ADD COLUMN     "cacheEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cacheTtl" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "HttpEndpoint" ADD COLUMN     "cacheEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cacheTtl" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "HttpRequestLog" ADD COLUMN     "clientAuthenticationId" TEXT;

-- AddForeignKey
ALTER TABLE "HttpRequestLog" ADD CONSTRAINT "HttpRequestLog_clientAuthenticationId_fkey" FOREIGN KEY ("clientAuthenticationId") REFERENCES "HttpClientAuthentication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
