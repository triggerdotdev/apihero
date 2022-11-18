-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "request_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Log_request_id_time_key" ON "Log"("request_id", "time");
