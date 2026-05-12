// server/src/routes/resumeRoutes.js
import express from "express";
import { uploadResume, resumeUploadMiddleware } from "../controllers/resumeController.js";

const router = express.Router();

router.post("/upload", resumeUploadMiddleware, uploadResume);

export default router;
