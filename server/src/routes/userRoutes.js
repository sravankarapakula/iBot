import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ added

const router = express.Router();

// 🧍 Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// 👤 Profile (Protected)
router.get("/profile", protect, getProfile);

export default router;
