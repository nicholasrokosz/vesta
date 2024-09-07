-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('SUPERADMIN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "global_role" "GlobalRole" NOT NULL DEFAULT 'CUSTOMER',
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "organization_role" "OrganizationRole";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
