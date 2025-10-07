import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET current user's profile
export const getProfile = async (req: any, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE current user's profile
export const updateProfile = async (req: any, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const {
      phone,
      location,
      about,
      availability,
      skills,
      photoUrl,
      resumeUrl,
      documents,
      profileCompleted
    } = req.body;

    const updatedUser = await prisma.user.update({
  where: { id: req.user.id },
  data: {
    phone,
    location,
    about,
    availability,
    skills: skills || [],
    photoUrl,
    resumeUrl,
    documents: documents || [],
    profileCompleted: profileCompleted || true
  },
});

    res.json({ user: updatedUser, message: "Profile updated successfully" });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
