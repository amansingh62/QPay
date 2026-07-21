-- CreateTable
CREATE TABLE "TransactionSecurity" (
    "id" TEXT NOT NULL,
    "transactionPin" TEXT,
    "isPinSet" BOOLEAN NOT NULL DEFAULT false,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedUntil" TIMESTAMP(3),
    "lastPinChangedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionSecurity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionSecurity_userId_key" ON "TransactionSecurity"("userId");

-- AddForeignKey
ALTER TABLE "TransactionSecurity" ADD CONSTRAINT "TransactionSecurity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
