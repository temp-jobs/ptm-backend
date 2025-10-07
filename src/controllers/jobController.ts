import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Create a new job
export const createJob = async (req: Request, res: Response) => {
  try {
    const {
      title,
      company,
      category,
      jobType,
      location,
      salary,
      description,
      requirements,
      hoursPerWeek,
      contactEmail,
    } = req.body;

    const job = await prisma.job.create({
      data: {
        title,
        company,
        category,
        jobType,
        location,
        salary,
        description,
        requirements,
        hoursPerWeek,
        contactEmail,
      },
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT: Update an existing job
export const updateJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const {
      title,
      company,
      category,
      jobType,
      location,
      salary,
      description,
      requirements,
      hoursPerWeek,
      contactEmail,
      status,
    } = req.body;

    const existingJob = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existingJob) return res.status(404).json({ success: false, message: "Job not found" });

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        company,
        category,
        jobType,
        location,
        salary,
        description,
        requirements,
        hoursPerWeek,
        contactEmail,
        status,
      },
    });

    res.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET: List all jobs
export const getJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({ orderBy: { postedDate: "desc" } });
    res.json({ success: true, jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
