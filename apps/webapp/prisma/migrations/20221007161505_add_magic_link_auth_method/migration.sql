-- AlterEnum
ALTER TYPE "AuthenticationMethod" ADD VALUE 'MAGIC_LINK';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "accessToken" DROP NOT NULL;
