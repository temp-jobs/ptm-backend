import { Router } from "express";
import { createJob, updateJob, getJobs } from "../controllers/jobController";

const router = Router();

// Create a new job
router.post("/", createJob);

// Update an existing job
router.put("/:id", updateJob);

// Get all jobs
router.get("/", getJobs);

export default router;
