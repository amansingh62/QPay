/*
  Warnings:

  - Changed the type of `bankName` on the `BankAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "bankName",
ADD COLUMN     "bankName" TEXT NOT NULL;
