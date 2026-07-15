import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma.js";

type UpdateProfileInput = Partial<{
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
}>;

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { profilePicture, name, email, phone } = req.body;
    const userId = req.userId;

    if (name && !name.trim()) {
      return res.status(400).json({
        message: "Invalid Name",
      });
    }

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updateData: UpdateProfileInput = {};

    if (name) {
      updateData.name = name.trim();
    }

    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingEmail)
        return res.status(409).json({ message: "Email already exists" });

      updateData.email = email.trim().toLowerCase();
    }

    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingPhone) {
        return res.status(409).json({
          message: "Phone number already exists",
        });
      }

      updateData.phone = phone.trim();
    }

    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const update = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Profile Updated Successfully", user: update });
  } catch (error) {
    console.log("Profile Update Error: ", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};
