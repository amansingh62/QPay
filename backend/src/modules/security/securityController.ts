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

