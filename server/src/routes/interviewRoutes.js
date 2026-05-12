import express from "express";
import { generateInterview, evaluateAnswer } from "../controllers/interviewController.js";

const router = express.Router();

router.post("/generate", generateInterview);
router.post("/evaluate", evaluateAnswer);

export default router;
