import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma.js";
import { TransactionStatus, TransactionType } from "../../../generated/prisma/enums.js";
import { verifyTransactionPin } from "../security/securityService.js";

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;
    const { query } = req.query;

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: req.userId,
        },
        OR: [
          {
            phone: {
              contains: phone as string,
            },
          },
           {
        name: {
          contains: query as string,
          mode: "insensitive",
        },
      },
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        profilePicture: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const transfer = async (req: Request, res: Response) => {
  try {
  const userId = req.userId;
  const { receiverId } = req.params as { receiverId: string };
  const {  amount, pin } = req.body;

  if(!userId) return res.status(401).json({ message: "Unauthorized" });

  await verifyTransactionPin(req.userId!, pin);

  if(!amount || amount < 0) return res.status(400).json({ message: "Invalid amount" });

  if(!receiverId) return res.status(404).json({ message: "Receiver not found" });

  const receiver = await prisma.user.findUnique({
    where: {
      id: receiverId
    },
    select: {
      id: true
    }
  });

  if(!receiver) return res.status(404).json({ message: "Receiver not found" });

  if(userId === receiver.id) {
    return res.status(403).json({ message: "You can't send money to yourself" });
  };

  const senderWallet = await prisma.wallet.findUnique({
    where: {
      userId
    },

    select: {
      id: true,
      dailyLimit: true,
      monthlyLimit: true,
      dailySpent: true,
      monthlySpent: true,
    }

  });

  if(!senderWallet) return res.status(404).json({ message: "Sender Wallet not exists" });

  if (senderWallet.dailySpent.plus(amount).greaterThan(senderWallet.dailyLimit)) {
      return res.status(403).json({
        message: "Daily transaction limit exceeded",
      });
    }

    if (senderWallet.monthlySpent.plus(amount).greaterThan(senderWallet.monthlyLimit)) {
      return res.status(403).json({
        message: "Monthly transaction limit exceeded",
      });
    }

  const receiverWallet = await prisma.wallet.findUnique({
    where: {
      userId: receiverId
    },
    select: {
      id: true
    }
  });

  if(!receiverWallet) return res.status(404).json({ message: "Receiver wallet not exists" });

  
  const transfer = await prisma.$transaction(async (tx) => {

    const sender = await tx.wallet.updateMany({
      where: {
        userId,
        balance: {
          gte: amount
        },
      }, 
      data: {
          balance: {
            decrement: amount
          },

          dailySpent: {
              increment: amount
            },

            monthlySpent: {
              increment: amount
            }
        }
    });

    if(sender.count === 0) {
      throw new Error("Insufficient balance");
    }

    await tx.wallet.update({
      where: {
          userId: receiverId
      },
      data: {
        balance: {
          increment: amount
        }
      }
    });

    const transaction = await tx.transaction.create({
      data: {
        amount,
        senderWalletId: senderWallet.id,
        receiverWalletId: receiverWallet.id,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.SUCCESS,
      }
    });

    return transaction;
  });

  return res.status(200).json({ message: "Money transferred successfully",  transfer});
  }  catch (error) {
  console.error(error);

  return res.status(
    error instanceof Error &&
    (error.message === "Invalid Transaction PIN" ||
      error.message === "Transaction PIN not set" ||
      error.message === "Insufficient balance")
      ? 400
      : 500
  ).json({
    message:
      error instanceof Error
        ? error.message
        : "Internal Server Error",
  });
}
};