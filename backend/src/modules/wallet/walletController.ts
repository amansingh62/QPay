import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma.js";

export const getWallet = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

    if(!userId) return res.status(401).json({ message: "Unauthorized" });

    const wallet = await prisma.wallet.findUnique({
        where: {
            userId
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
        }
    });

    if(!wallet) return res.status(404).json({ message: "Wallet not found" });

    return res.status(200).json({ message: "Wallet fetched successfully" , wallet});
    } catch (error) {
        console.error("Wallet Fetching Failed: ", error);

        return res.status(500).json({ message: "Internal Server Error" });
    };
};

