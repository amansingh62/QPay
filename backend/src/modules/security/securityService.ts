import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma.js";

export const verifyTransactionPin = async (
  userId: string,
  pin: string
) => {
  const security = await prisma.transactionSecurity.findUnique({
    where: {
      userId,
    },
    select: {
      transactionPin: true,
      failedAttempts: true,
    },
  });

  if (!security?.transactionPin) {
    throw new Error("Transaction PIN not set");
  }

  const isValid = await bcrypt.compare(
    pin,
    security.transactionPin
  );

  if (!isValid) {
    await prisma.transactionSecurity.update({
      where: {
        userId,
      },
      data: {
        failedAttempts: {
          increment: 1,
        },
      },
    });

    throw new Error("Invalid Transaction PIN");
  }

  await prisma.transactionSecurity.update({
    where: {
      userId,
    },
    data: {
      failedAttempts: 0,
      lastSuccessfulVerification: new Date(),
    },
  });
};