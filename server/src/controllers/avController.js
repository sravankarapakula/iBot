// server/src/controllers/avController.js

import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── PATHS ─────────────────────────────────────────────
const AV_DIR      = path.resolve(__dirname, "../../../AV");
const APP_PY      = path.join(AV_DIR, "app.py");
const RESULT_JSON = path.join(AV_DIR, "result.json");
const STOP_FLAG   = path.join(AV_DIR, "stop.flag");

// ── PYTHON (VENV) ─────────────────────────────────────
const VENV_PYTHON = path.join(AV_DIR, "interview_env", "Scripts", "python.exe");
const PYTHON_BIN  = fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : "python";

// ── PROCESS HANDLE ────────────────────────────────────
let avProcess = null;

const isRunning = () =>
  avProcess !== null && avProcess.exitCode === null;


// =====================================================
// START AV INTERVIEW
// =====================================================
export const startAV = (req, res) => {
  if (isRunning()) {
    return res.status(409).json({
      success: false,
      message: "Interview already running",
    });
  }

  // ── CLEAN OLD FILES ─────────────────────────────
  [RESULT_JSON, STOP_FLAG].forEach((file) => {
    try {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    } catch (e) {
      console.warn("[AV] Cleanup failed:", file);
    }
  });

  console.log("\n========== AV START ==========");
  console.log("[AV] Python :", PYTHON_BIN);
  console.log("[AV] Script :", APP_PY);
  console.log("[AV] CWD    :", AV_DIR);

  try {
    avProcess = spawn(PYTHON_BIN, [APP_PY], {
      cwd: AV_DIR,
      stdio: ["ignore", "pipe", "pipe"], // show logs
    });

    console.log("[AV DEBUG] Spawn called");

    // ── LOGS ─────────────────────────────
    avProcess.stdout.on("data", (d) =>
      console.log("[AV]", d.toString().trim())
    );

    avProcess.stderr.on("data", (d) =>
      console.error("[AV ERROR]", d.toString().trim())
    );

    avProcess.on("exit", (code, signal) => {
      console.log(`[AV] Process exited → code=${code}, signal=${signal}`);

      if (code !== 0) {
        console.error("[AV ERROR] Python crashed");
      }

      avProcess = null;
    });

    avProcess.on("error", (err) => {
      console.error("[AV] Spawn failed:", err.message);
      avProcess = null;
    });

    // ── VALIDATE START ─────────────────────
    setTimeout(() => {
      if (!isRunning()) {
        console.error("[AV] Failed to start");
      } else {
        console.log("[AV] Running OK");
      }
    }, 1000);

    return res.status(200).json({
      success: true,
      message: "AV Interview started",
    });

  } catch (err) {
    console.error("[AV] Spawn exception:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// =====================================================
// STOP AV INTERVIEW
// =====================================================
export const stopAV = (req, res) => {
  try {
    console.log("\n========== AV STOP ==========");

    // Write the flag after 1.5 s to allow any in-flight frame to be processed
    // (prevents the edge case where flag is seen on the very first frame).
    setTimeout(() => {
      fs.writeFileSync(STOP_FLAG, "stop");
      console.log("[AV] stop.flag created — Python will exit after current frame.");
    }, 1500);

    // NOTE: do NOT null avProcess here. avProcess is set to null only when
    // Python's 'exit' event fires (registered in startAV), which is accurate.
    // Blindly nulling it here would make isRunning() return false while Whisper
    // is still processing, causing getStatus.resultReady to flip prematurely.

    return res.status(200).json({
      success: true,
      message: "Stop signal sent",
    });

  } catch (err) {
    console.error("[AV] Stop error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// =====================================================
// STATUS
// =====================================================
export const getStatus = (req, res) => {
  res.status(200).json({
    success: true,
    running: isRunning(),
    resultReady: fs.existsSync(RESULT_JSON),
  });
};


// =====================================================
// GET RESULT (WITH POLLING)
// =====================================================
export const getResult = async (req, res) => {
  try {
    console.log("\n========== FETCH RESULT ==========");

    // ── WAIT FOR FILE ─────────────────────
    for (let i = 0; i < 20; i++) {
      if (fs.existsSync(RESULT_JSON)) {
        const data = JSON.parse(fs.readFileSync(RESULT_JSON, "utf-8"));

        console.log("[AV] result.json found");

        return res.status(200).json({
          success: true,
          data,
        });
      }

      await new Promise((r) => setTimeout(r, 500));
    }

    console.error("[AV] Timeout waiting for result.json");

    return res.status(500).json({
      success: false,
      message: "Timeout waiting for result",
    });

  } catch (err) {
    console.error("[AV] Result error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};