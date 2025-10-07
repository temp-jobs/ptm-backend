import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY! // use ANON key, not service role
);

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid authorization format" });
    }

    // ✅ Ask Supabase to validate the JWT and return the user
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      console.error("Supabase verification error:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Optional: fetch corresponding Prisma record for richer data
    let dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
    });

    // If not found, fallback to lookup by email
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: data.user.email! } });
    }
    if (!dbUser) {
      // Optional: auto-create Prisma user if missing
      req.user = await prisma.user.create({
        data: {
          id: data.user.id,
          name: data.user.user_metadata?.name || "",
          email: data.user.email!,
          role: "user",
          skills: [],
        },
      });
    } else {
      req.user = dbUser;
    }
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
