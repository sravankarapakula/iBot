import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// AUTH ROUTES
router.post("/register", register);
router.post("/login", login);

// OPTIONAL: VERIFY USER (useful for frontend auth persistence)
router.get("/me", protect, (req, res) => {
    res.status(200).json({
        user: req.user
    });
});

export default router;
