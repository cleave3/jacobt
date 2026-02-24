/*
  Warnings:

  - You are about to drop the column `approvedById` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedById` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_rejectedById_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "approvedById",
DROP COLUMN "rejectedById";
