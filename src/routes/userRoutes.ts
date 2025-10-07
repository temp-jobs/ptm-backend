import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/updateProfile", authMiddleware, updateProfile);

export default router;
