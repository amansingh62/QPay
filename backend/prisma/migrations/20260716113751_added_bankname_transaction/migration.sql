-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "receiverBankAccountId" TEXT,
ADD COLUMN     "senderBankAccountId" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_senderBankAccountId_fkey" FOREIGN KEY ("senderBankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_receiverBankAccountId_fkey" FOREIGN KEY ("receiverBankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
