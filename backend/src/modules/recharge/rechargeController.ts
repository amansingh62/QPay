import type { Request, Response } from "express";
import { verifyTransactionPin } from "../security/securityService.js";
import { prisma } from "../../../lib/prisma.js";
import {
  RechargeStatus,
  TransactionStatus,
  TransactionType,
} from "../../../generated/prisma/enums.js";

export const recharge = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { pin, amount, operator, phone } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    await verifyTransactionPin(userId, pin);

    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        dailySpent: true,
        monthlySpent: true,
        dailyLimit: true,
        monthlyLimit: true,
      },
    });

    if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found",
      });
    }

    if (
      wallet.dailySpent.plus(amount).greaterThan(wallet.dailyLimit)
    ) {
      return res.status(403).json({
        message: "Daily transaction limit exceeded",
      });
    }

    if (
      wallet.monthlySpent.plus(amount).greaterThan(wallet.monthlyLimit)
    ) {
      return res.status(403).json({
        message: "Monthly transaction limit exceeded",
      });
    }

    const recharge = await prisma.$transaction(async (tx) => {
      const sender = await tx.wallet.updateMany({
        where: {
          userId,
          balance: {
            gte: amount,
          },
        },
        data: {
          balance: {
            decrement: amount,
          },
          dailySpent: {
            increment: amount,
          },
          monthlySpent: {
            increment: amount,
          },
        },
      });

      if (sender.count === 0) {
        throw new Error("Insufficient balance");
      }

      const transaction = await tx.transaction.create({
        data: {
          amount,
          type: TransactionType.RECHARGE,
          status: TransactionStatus.SUCCESS,
          senderWalletIdId: wallet.id, 
        },
      });

      return await tx.recharge.create({
        data: {
          phone,
          operator,
          amount,
          status: RechargeStatus.SUCCESS,
          transactionId: transaction.id,
          walletId: wallet.id,
        },
      });
    });

    return res.status(200).json({
      message: "Recharge successful",
      recharge,
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
