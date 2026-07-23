import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma.js";
import bcrypt from "bcrypt";

export const setTransactionPin = async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const securityPin = await prisma.transactionSecurity.findUnique({
      where: {
        userId,
      },
    });

    if (securityPin)
      return res.status(409).json({ message: "Transaction pin already set" });

    const hashPin = await bcrypt.hash(pin, 12);

    await prisma.transactionSecurity.create({
      data: {
        userId,
        transactionPin: hashPin,
      },
    });

    return res
      .status(201)
      .json({ message: "Transaction Pin set successfully" });
  } catch (error) {
    console.error("Transaction pin set error: ", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const changeTransactionPin = async (
  req: Request,
  res: Response
) => {
  try {
    const { currentPin, newPin } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (currentPin === newPin) {
      return res.status(400).json({
        message: "New PIN must be different from the current PIN",
      });
    }

    const security = await prisma.transactionSecurity.findUnique({
      where: {
        userId,
      },
      select: {
        transactionPin: true,
        failedAttempts: true,
        isLocked: true,
        lockedUntil: true,
      },
    });

    if (!security?.transactionPin) {
      return res.status(404).json({
        message: "Transaction PIN not set",
      });
    }

    if (
      security.isLocked &&
      security.lockedUntil &&
      security.lockedUntil > new Date()
    ) {
      return res.status(423).json({
        message: "Transaction PIN is temporarily locked",
      });
    }

    const isValid = await bcrypt.compare(
      currentPin,
      security.transactionPin
    );

    if (!isValid) {
      const failedAttempts = security.failedAttempts + 1;

      await prisma.transactionSecurity.update({
        where: {
          userId,
        },
        data: {
          failedAttempts,
          ...(failedAttempts >= 5 && {
            isLocked: true,
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000), 
            failedAttempts: 0,
          }),
        },
      });

      return res.status(400).json({
        message: "Current Transaction PIN is incorrect",
      });
    }

    const hashedPin = await bcrypt.hash(newPin, 12);

    await prisma.transactionSecurity.update({
      where: {
        userId,
      },
      data: {
        transactionPin: hashedPin,
        failedAttempts: 0,
        isLocked: false,
        lockedUntil: null,
        lastPinChangedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Transaction PIN changed successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Internal Server Error",
    });
  }
};

