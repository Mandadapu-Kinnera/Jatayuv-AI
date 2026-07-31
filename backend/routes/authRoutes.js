import { Router } from "express";
import { signup, login, getMe, logout } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Authenticated routes
router.get("/me", requireAuth, getMe);
router.post("/logout", requireAuth, logout);

export default router;
