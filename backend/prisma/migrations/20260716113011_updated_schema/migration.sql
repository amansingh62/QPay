/*
  Warnings:

  - You are about to drop the column `status` on the `Wallet` table. All the data in the column will be lost.
  - Changed the type of `bankName` on the `BankAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BankName" AS ENUM ('SBI', 'ICICI', 'AXIS', 'HDFC', 'PNB');

-- DropIndex
DROP INDEX "BankAccount_ifscCode_key";

-- DropIndex
DROP INDEX "BankAccount_userId_key";

-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "bankName",
ADD COLUMN     "bankName" "BankName" NOT NULL,
ALTER COLUMN "accountNumber" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "status";
