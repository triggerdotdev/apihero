-- CreateEnum
CREATE TYPE "AuthenticationMethod" AS ENUM ('GITHUB');

-- DropForeignKey
ALTER TABLE "Password" DROP CONSTRAINT "Password_userId_fkey";

TRUNCATE TABLE "User" CASCADE;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "authenticationExtraParams" JSONB,
ADD COLUMN     "authenticationMethod" "AuthenticationMethod" NOT NULL,
ADD COLUMN     "authenticationProfile" JSONB,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "familyName" TEXT,
ADD COLUMN     "givenName" TEXT;

-- DropTable
DROP TABLE "Password";
