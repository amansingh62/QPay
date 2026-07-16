import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma.js";
import {
  BankName,
  TransactionStatus,
  TransactionType,
} from "../../../generated/prisma/enums.js";

export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const wallet = await prisma.wallet.findUnique({
      where: {
        userId,
      },

      select: {
        id: true,
        balance: true,
        status: true,
        isFrozen: true,
        dailySpent: true,
        monthlySpent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    return res
      .status(200)
      .json({ message: "Wallet fetched successfully", wallet });
  } catch (error) {
    console.error("Wallet Fetching Failed: ", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const linkBankAccount = async (req: Request, res: Response) => {
  const { bankName, accountHolder, accountNumber, ifscCode } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  if (!Object.values(BankName).includes(bankName)) {
    return res.status(400).json({
      message: "Invalid bank name",
    });
  }

  if (!accountHolder || !accountHolder.trim() || !accountNumber || !ifscCode) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingAccount = await prisma.bankAccount.findUnique({
    where: {
      accountNumber,
    },
  });

  if (existingAccount) {
    return res.status(409).json({
      message: "Bank account already linked",
    });
  }

  const bank = await prisma.bankAccount.create({
    data: {
      bankName,
      accountHolder,
      accountNumber,
      ifscCode,
      userId,
    },
  });

  return res.status(201).json({
  message: "Bank account linked successfully",
  bank,
});
};

export const getBankAccounts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        bankName: true,
        accountHolder: true,
        accountNumber: true,
        balance: true,
        ifscCode: true,
      },
    });

    return res.status(200).json({
      message: "Bank accounts fetched successfully",
      bankAccounts,
    });
  } catch (error) {
    console.error("Get Bank Accounts Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const addMoney = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { amount, accountNumber } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
      });
    }

    if (!accountNumber) {
      return res.status(400).json({
        message: "Account number is required",
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

    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        userId,
        accountNumber,
      },
      select: {
        id: true,
      },
    });

    if (!bankAccount) {
      return res.status(404).json({
        message: "Bank account not found",
      });
    }

    const updatedWallet = await prisma.$transaction(async (tx) => {
      const bank = await tx.bankAccount.updateMany({
        where: {
          userId,
          accountNumber,
          balance: {
            gte: amount,
          },
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      if (bank.count === 0) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const wallet = await tx.wallet.update({
        where: {
          userId,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
        select: {
          id: true,
          balance: true,
        },
      });

      await tx.transaction.create({
        data: {
          amount,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.SUCCESS,
          receiverWalletId: wallet.id,
          senderBankAccountId: bankAccount.id,
        },
      });

      return wallet;
    });

    return res.status(200).json({
      message: "Money added successfully",
      wallet: updatedWallet,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        message: "Insufficient bank balance",
      });
    }

    console.error("Add Money Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
