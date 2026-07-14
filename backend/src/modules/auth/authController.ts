import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma.js";
import bcrypt from "bcrypt";
import { setAuthCookies } from "../../utils/cookies.js";
import { signAccessToken, signRefreshToken } from "../../utils/tokens.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (!phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
   try {
     const { email, phone, password } = req.body;

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { phone },
            ]
        }
    });

    if(!user) return res.status(403).json({ message: "User don't exists" });

    const isValid = await bcrypt.compare(password, user.password);

    if(!isValid) return res.status(400).json({ message: "Invalid Credentials" });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ message: "User logged in successfully" });
   }
   
   catch (error) {
    console.error("Login error: ", error);

    return res.status(500).json({ message: "Internal Server Error" });
   }
};

