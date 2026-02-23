-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPERADMIN';

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "associatedUsersId" TEXT[];

-- AlterTable
ALTER TABLE "Target" ADD COLUMN     "numOfMembers" INTEGER NOT NULL DEFAULT 6;
