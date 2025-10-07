import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { User as SupabaseUser } from "@supabase/supabase-js"; // Import for explicit typing

const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Service role key for server
const supabase = createClient(supabaseUrl, supabaseKey);

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // Basic validation (optional but recommended)
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    // 1️⃣ Create user in Supabase Auth
    const { data, error: supabaseError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // automatically confirm for demo
    });

    if (supabaseError || !data) {
      return res.status(400).json({ message: supabaseError?.message || "Failed to create user in Supabase" });
    }

    // Type assertion for clarity (data is now confirmed non-null)
    const supabaseUser = data as unknown as SupabaseUser;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2️⃣ Create corresponding user in your database via Prisma
    const user = await prisma.user.create({
      data: {
        id: supabaseUser.id, // Now safely accessible
        name,
        email,
        role,
        skills: []
      },
    });

    return res.status(201).json({ user, message: "User  created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // 1️⃣ Authenticate with Supabase
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !authData?.user || !authData.session) {
      return res.status(400).json({ error: error?.message || "Invalid credentials" });
    }

    const supabaseUser = authData.user;

    // 2️⃣ Fetch user from Prisma DB
    let user = await prisma.user.findUnique({ where: { id: supabaseUser.id } });


    // 2a️⃣ If not found by UUID, try by email
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: supabaseUser.email! } });
    }

    // 3️⃣ Optional: auto-create Prisma user if missing
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || "",
          email: supabaseUser.email!,
          role: req.body.role,
          skills: [], // required array
        },
      });
    }

    return res.json({ user, token: authData.session.access_token });

  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};


export const getMe = async (req: any, res: Response) => {
  // Assuming req.user is populated via middleware from JWT verification
  // Add a check for safety
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(req.user);
};
