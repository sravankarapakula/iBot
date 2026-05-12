// src/pages/InterviewAV.jsx
// AV Interview Mode — fully UI-controlled, no terminal interaction.
// Lifecycle: start → [camera runs] → stop (flag) → poll status → render results
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Video,
  VideoOff,
  StopCircle,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Mic,
  FileText,
  Eye,
  Smile,
  Loader2,
  Shield,
  BarChart3,
  Clock,
  ZapOff,
  X,
  RefreshCcw,
  Wifi,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Phase definitions ─────────────────────────────────────────────────────────
const STATUS = {
  idle:       { label: "Ready to Start",           color: "text-gray-400",    dot: "bg-gray-500"    },
  starting:   { label: "Launching AV Engine…",     color: "text-yellow-300",  dot: "bg-yellow-400"  },
  live:       { label: "● Recording",              color: "text-red-400",     dot: "bg-red-400"     },
  stopping:   { label: "Stopping & Processing…",   color: "text-blue-300",    dot: "bg-blue-400"    },
  polling:    { label: "Waiting for Analysis…",    color: "text-violet-300",  dot: "bg-violet-400"  },
  done:       { label: "Analysis Complete",        color: "text-emerald-400", dot: "bg-emerald-400" },
  error:      { label: "Error",                    color: "text-red-400",     dot: "bg-red-500"     },
};

// ── Reusable components ───────────────────────────────────────────────────────
function MetricCard({ icon, label, value, accent = "text-blue-300", warn = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 border rounded-xl px-4 py-3 flex items-center gap-3
                  ${warn ? "border-red-500/40 bg-red-500/10" : "border-white/10"}`}
    >
      <span className={`shrink-0 ${warn ? "text-red-400" : accent}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-0.5">{label}</p>
        <p className={`text-sm font-semibold truncate ${warn ? "text-red-300" : "text-white"}`}>{value}</p>
      </div>
    </motion.div>
  );
}

function PctBar({ label, pct, colorClass = "bg-blue-500" }) {
  const clamped = Math.max(0, Math.min(100, pct ?? 0));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{clamped.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colorClass} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function InterviewAV() {
  const navigate = useNavigate();
  const location = useLocation();

  const { role, stack, resumeText } = location.state || {};
  const roleLabel  = typeof role === "string" ? role : (role?.title || "Unknown Role");
  const stackLabel = stack?.name || null;

  const [phase,   setPhase]   = useState("idle");
  const [results, setResults] = useState(null);
  const [errMsg,  setErrMsg]  = useState("");
  const [elapsed, setElapsed] = useState(0);

  const timerRef  = useRef(null);
  const pollRef   = useRef(null);

  // ── Live elapsed timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "live") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const fmtTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Polling for result after stop ──────────────────────────────────────────
  const startPolling = useCallback(() => {
    setPhase("polling");
    let attempts = 0;
    const MAX_ATTEMPTS = 120; // 60 s at 500 ms intervals

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res  = await fetch(`${API_BASE}/api/av/status`);
        const data = await res.json();

        if (data.resultReady) {
          clearInterval(pollRef.current);
          // Fetch the actual results
          const r2   = await fetch(`${API_BASE}/api/av/result`);
          const d2   = await r2.json();
          if (d2.success) {
            setResults(d2.data);
            setPhase("done");
          } else {
            throw new Error(d2.message || "Failed to fetch results");
          }
        } else if (attempts >= MAX_ATTEMPTS) {
          clearInterval(pollRef.current);
          setErrMsg("Timed out waiting for analysis. The session may have been too short.");
          setPhase("error");
        }
      } catch (err) {
        clearInterval(pollRef.current);
        setErrMsg(err.message);
        setPhase("error");
      }
    }, 500);
  }, []);

  useEffect(() => () => clearInterval(pollRef.current), []);

  // ── START ───────────────────────────────────────────────────────────────────
  const handleStart = async () => {
    setPhase("starting");
    setErrMsg("");
    setResults(null);
    try {
      const res  = await fetch(`${API_BASE}/api/av/start`, { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to start");
      setPhase("live");
    } catch (err) {
      setErrMsg(err.message);
      setPhase("error");
    }
  };

  // ── STOP ────────────────────────────────────────────────────────────────────
  // Writes stop.flag via /api/av/stop (non-blocking — backend responds immediately
  // after writing the flag, then Python processes asynchronously).
  // Frontend polls /api/av/status until resultReady === true.
  const handleStop = async () => {
    setPhase("stopping");
    try {
      // Returns immediately after writing stop.flag
      await fetch(`${API_BASE}/api/av/stop`, { method: "POST" });
      // Start polling /api/av/status until resultReady === true
      startPolling();
    } catch (err) {
      setErrMsg(err.message);
      setPhase("error");
    }
  };

  // ── RESET ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    clearInterval(pollRef.current);
    setPhase("idle");
    setResults(null);
    setErrMsg("");
    setElapsed(0);
  };

  const isLive       = phase === "live";
  const isProcessing = ["starting", "stopping", "polling"].includes(phase);
  const isDone       = phase === "done";
  const isError      = phase === "error";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 flex flex-col items-center relative z-0">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mb-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Video size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Video Interview</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {roleLabel}
              {stackLabel && <span className="text-indigo-400"> · {stackLabel}</span>}
            </p>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${STATUS[phase].dot}
                        ${isLive || isProcessing ? "animate-pulse" : ""}`}
          />
          <span className={`text-xs font-semibold ${STATUS[phase].color}`}>
            {STATUS[phase].label}
          </span>
          {isLive && (
            <span className="ml-auto font-mono text-sm text-red-300 tabular-nums">
              {fmtTime(elapsed)}
            </span>
          )}
          {phase === "polling" && (
            <span className="ml-auto flex items-center gap-1 text-xs text-violet-400">
              <Wifi size={12} className="animate-pulse" /> Whisper is transcribing…
            </span>
          )}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          CAMERA VIEWPORT (shown while not done)
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {!isDone && (
          <motion.div
            key="viewport"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="w-full max-w-3xl"
          >
            {/* Simulated camera frame */}
            <div
              className={`w-full aspect-video rounded-2xl overflow-hidden border relative
                          backdrop-blur-xl shadow-2xl
                          ${isLive ? "border-red-500/50 shadow-red-500/20" : "border-white/10 bg-white/5"}`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">

                {phase === "idle" && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <VideoOff size={32} className="text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-sm max-w-xs">
                      The camera opens in an <strong className="text-white">OpenCV window</strong> when you click Start.
                      Click <strong className="text-white">Stop Interview</strong> here to end and get your scorecard.
                    </p>
                    <p className="text-gray-600 text-xs">No keyboard interaction required.</p>
                  </>
                )}

                {(phase === "starting") && (
                  <><Loader2 size={38} className="text-yellow-400 animate-spin" />
                    <p className="text-yellow-200 text-sm">Launching Python AV engine…</p>
                    <p className="text-gray-600 text-xs">Loading Whisper & MediaPipe (first start may take 15–30 s)</p>
                  </>
                )}

                {isLive && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.12, 1] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center"
                    >
                      <Activity size={32} className="text-red-400" />
                    </motion.div>
                    <p className="text-red-300 font-semibold text-sm">Recording in progress</p>
                    <p className="text-gray-500 text-xs">
                      The OpenCV camera window is active. Look into the camera and speak naturally.
                    </p>
                    <p className="text-gray-600 text-xs">
                      Click <strong className="text-white">Stop Interview</strong> below when finished.
                    </p>
                  </>
                )}

                {(phase === "stopping") && (
                  <><Loader2 size={38} className="text-blue-400 animate-spin" />
                    <p className="text-blue-200 text-sm">Stopping session…</p>
                  </>
                )}

                {phase === "polling" && (
                  <>
                    <Loader2 size={38} className="text-violet-400 animate-spin" />
                    <p className="text-violet-200 text-sm">Whisper is transcribing your audio…</p>
                    <p className="text-gray-500 text-xs">This takes 10–45 seconds depending on session length.</p>
                    <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                      <motion.div
                        className="h-full bg-violet-500 rounded-full"
                        animate={{ width: ["0%", "90%"] }}
                        transition={{ duration: 40, ease: "easeInOut" }}
                      />
                    </div>
                  </>
                )}

                {isError && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                      <AlertTriangle size={28} className="text-red-400" />
                    </div>
                    <p className="text-red-300 font-semibold text-sm">Something went wrong</p>
                    <p className="text-gray-400 text-xs max-w-sm">{errMsg}</p>
                  </>
                )}
              </div>

              {/* LIVE badge */}
              {isLive && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">Live</span>
                </div>
              )}
            </div>

            {/* ── Controls ── */}
            <div className="flex flex-col sm:flex-row gap-3 mt-5">

              {/* Start */}
              {(phase === "idle" || isError) && (
                <motion.button
                  id="av-start-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl
                             bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold
                             shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow
                             border border-white/10 text-sm"
                >
                  <PlayCircle size={17} />
                  {isError ? "Retry" : "Start Interview"}
                </motion.button>
              )}

              {/* Stop — only while camera is live */}
              {isLive && (
                <motion.button
                  id="av-stop-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStop}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl
                             bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold
                             shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-shadow
                             border border-white/10 text-sm"
                >
                  <StopCircle size={17} />
                  Stop Interview
                </motion.button>
              )}

              {/* Reset on error */}
              {isError && (
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                             bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400
                             hover:text-white transition text-sm"
                >
                  <RefreshCcw size={15} /> Reset
                </button>
              )}

              {/* Exit */}
              {!isProcessing && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                             bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400
                             hover:text-white transition text-sm"
                >
                  <X size={15} /> Exit
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          RESULTS PANEL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isDone && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl space-y-6"
          >
            {/* Success banner */}
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <p className="text-emerald-200 text-sm font-medium">Interview analysis complete!</p>
              <button
                onClick={handleReset}
                className="ml-auto text-emerald-500 hover:text-emerald-300 flex items-center gap-1 text-xs transition"
              >
                <RefreshCcw size={12} /> New session
              </button>
            </div>

            {/* ── VISION METRICS ── */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="flex items-center gap-2 text-blue-200 font-bold text-base mb-5">
                <Eye size={17} className="text-blue-400" /> Vision Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <MetricCard icon={<Activity size={16} />} label="Confidence"   value={`${results.vision?.confidence?.toFixed(1)   ?? "—"}%`} accent="text-emerald-400" />
                <MetricCard icon={<ZapOff size={16}   />} label="Fidgeting"    value={`${results.vision?.fidgeting?.toFixed(1)    ?? "—"}%`} accent="text-yellow-400" />
                <MetricCard icon={<Eye size={16}      />} label="Looking Away" value={`${results.vision?.looking_away?.toFixed(1) ?? "—"}%`} accent="text-orange-400" />
                <MetricCard icon={<Smile size={16}    />} label="Smiling"      value={`${results.vision?.smiling?.toFixed(1)      ?? "—"}%`} accent="text-pink-400"   />
              </div>
              <PctBar label="Confidence"   pct={results.vision?.confidence}   colorClass="bg-emerald-500" />
              <PctBar label="Fidgeting"    pct={results.vision?.fidgeting}    colorClass="bg-yellow-500"  />
              <PctBar label="Looking Away" pct={results.vision?.looking_away} colorClass="bg-orange-500"  />
              <PctBar label="Smiling"      pct={results.vision?.smiling}      colorClass="bg-pink-500"    />

              {(results.vision?.cheating ?? 0) > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                >
                  <Shield size={16} className="text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm font-semibold">
                    🚨 Proctoring Flag: Multiple faces detected in {results.vision?.cheating?.toFixed(1)}% of frames
                  </p>
                </motion.div>
              )}
            </div>

            {/* ── AUDIO METRICS ── */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="flex items-center gap-2 text-violet-200 font-bold text-base mb-5">
                <Mic size={17} className="text-violet-400" /> Audio Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetricCard icon={<Clock size={16}    />} label="Duration"    value={results.audio?.duration != null ? `${results.audio.duration.toFixed(1)}s` : "—"} accent="text-violet-400" />
                <MetricCard icon={<BarChart3 size={16}/>} label="Pace (WPM)"  value={results.audio?.wpm     != null ?  results.audio.wpm.toFixed(1)           : "—"} accent="text-blue-400" />
                <MetricCard icon={<AlertTriangle size={16}/>} label="Filler Words" value={results.audio?.fillers ?? "—"} accent="text-yellow-400" warn={(results.audio?.fillers ?? 0) > 5} />
              </div>
            </div>

            {/* ── TRANSCRIPT ── */}
            {results.transcript && (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h2 className="flex items-center gap-2 text-gray-200 font-bold text-base mb-4">
                  <FileText size={17} className="text-gray-400" /> Transcript
                </h2>
                <div className="max-h-48 overflow-y-auto pr-2">
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    "{results.transcript}"
                  </p>
                </div>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex flex-col sm:flex-row gap-3 pb-4">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl
                           bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold
                           shadow-lg shadow-violet-500/25 border border-white/10 text-sm"
              >
                <RefreshCcw size={16} /> New Video Interview
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl
                           bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300
                           hover:text-white transition text-sm"
              >
                Back to Dashboard
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
