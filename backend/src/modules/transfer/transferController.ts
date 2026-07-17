import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma.js";

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