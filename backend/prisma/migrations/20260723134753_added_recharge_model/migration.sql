-- CreateEnum
CREATE TYPE "Operator" AS ENUM ('Airtel', 'Jio', 'Vi', 'BSNL');

-- CreateEnum
CREATE TYPE "RechargeStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'RECHARGE';

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'RECHARGE';

-- CreateTable
CREATE TABLE "Recharge" (
    "id" TEXT NOT NULL,
    "operator" "Operator" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "phone" DECIMAL(65,30) NOT NULL,
    "status" "RechargeStatus" NOT NULL,
    "transactionId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recharge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recharge_transactionId_key" ON "Recharge"("transactionId");

-- AddForeignKey
ALTER TABLE "Recharge" ADD CONSTRAINT "Recharge_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recharge" ADD CONSTRAINT "Recharge_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
