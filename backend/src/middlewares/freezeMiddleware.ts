import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const isFrozen = async (req: Request, res: Response, next: NextFunction) => {
   try {
     const userId = req.userId;

    if(!userId) return res.status(401).json({ message: "Unauthorized" });

    const wallet = await prisma.wallet.findUnique({
        where: {
            userId
        },
        select: {
            id: true,
            isFrozen: true,
        }
    });

    if(!wallet) return res.status(404).json({ message: "Frozen details not found" });

    if(wallet.isFrozen === true) return res.status(403).json({ message: "Wallet is frozen" });

    next();
   } catch (error) {
    console.error("Frozen Middleware Error: ", error);

    return res.status(500).json({ message: "Internal Server Error" });
   };
};