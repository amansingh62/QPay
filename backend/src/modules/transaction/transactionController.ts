import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma.js";
import {
  Prisma,
  TransactionStatus,
  TransactionType,
} from "../../../generated/prisma/browser.js";

export const transactions = async (req: Request, res: Response) => {
  try {
    const {
      transactionType,
      status,
      direction,
      page = "1",
      limit = "10",
    } = req.query;

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found",
      });
    }

    const where: Prisma.TransactionWhereInput = {
      OR: [
        {
          senderWalletId: wallet.id,
        },
        {
          receiverWalletId: wallet.id,
        },
        {
          walletId: wallet.id,
        },
      ],
    };

    if (transactionType) {
      where.type = transactionType as TransactionType;
    }

    if (status) {
      where.status = status as TransactionStatus;
    }

    if (direction === "sent") {
      delete where.OR;
      where.senderWalletId = wallet.id;
    }

    if (direction === "received") {
      delete where.OR;
      where.receiverWalletId = wallet.id;
    }

    if (direction === "wallet") {
      delete where.OR;
      where.walletId = wallet.id;
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limitNumber,

      select: {
        id: true,
        referenceId: true,
        amount: true,
        type: true,
        status: true,
        createdAt: true,

        senderWallet: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },

        receiverWallet: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },

        senderBankAccount: {
          select: {
            bankName: true,
            accountHolder: true,
          },
        },

        receiverBankAccount: {
          select: {
            bankName: true,
            accountHolder: true,
          },
        },

        recharge: {
          select: {
            operator: true,
            phone: true,
          },
        },
      },
    });

    const total = await prisma.transaction.count({
      where,
    });

    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      referenceId: tx.referenceId,
      amount: tx.amount,
      type: tx.type,
      status: tx.status,
      createdAt: tx.createdAt,

      sender: tx.senderWallet
        ? {
            id: tx.senderWallet.user.id,
            name: tx.senderWallet.user.name,
            profilePicture: tx.senderWallet.user.profilePicture,
            walletId: tx.senderWallet.id,
            bankName: tx.senderBankAccount?.bankName ?? null,
          }
        : null,

      receiver: tx.receiverWallet
        ? {
            id: tx.receiverWallet.user.id,
            name: tx.receiverWallet.user.name,
            profilePicture: tx.receiverWallet.user.profilePicture,
            walletId: tx.receiverWallet.id,
            bankName: tx.receiverBankAccount?.bankName ?? null,
          }
        : null,

      recharge: tx.recharge
        ? {
            operator: tx.recharge.operator,
            phone: tx.recharge.phone,
          }
        : null,
    }));

    return res.status(200).json({
      message: "Transactions fetched successfully",
      data: formattedTransactions,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        hasNextPage: pageNumber * limitNumber < total,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};
