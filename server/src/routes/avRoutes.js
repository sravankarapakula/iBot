// server/src/routes/avRoutes.js
import express from "express";
import { startAV, stopAV, getResult, getStatus } from "../controllers/avController.js";

const router = express.Router();

// POST /api/av/start   — spawns app.py → av_service.run_interview()
router.post("/start",  startAV);

// POST /api/av/stop    — writes stop.flag, polls for result.json, returns data
router.post("/stop",   stopAV);

// GET  /api/av/result  — returns last written result.json (idempotent)
router.get("/result",  getResult);

// GET  /api/av/status  — { running: bool, resultReady: bool }
router.get("/status",  getStatus);

export default router;
