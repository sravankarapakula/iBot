import express from "express";
import { resumeUploadMiddleware, uploadResume } from "../controllers/resumeController.js";

const router = express.Router();

// Use the updated resume controller with PDF parsing
router.post("/upload", resumeUploadMiddleware, uploadResume);

export default router;
