import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import OpenAI from "openai";

import { connectDB } from "./config.js";

// ROUTES
import authRoutes from "./routes/auth.routes.js";   // ✅ NEW AUTH SYSTEM
import interviewRoutes from "./routes/interviewRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

// ✅ CONNECT DB
connectDB();

const app = express();

// ✅ MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        origin.match(/^http:\/\/localhost:\d+$/) ||
        origin === "https://ai-interview-bot.vercel.app"
      ) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS policy violation"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ OPENAI (GROQ)
export const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ================== AI CHAT ==================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a friendly and helpful AI assistant." },
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn’t process that.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("❌ Chat API Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// ================== ROUTES ==================
app.use("/api/auth", authRoutes);        // ✅ NEW
app.use("/api/interview", interviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/resume", resumeRoutes);

// ================== DB TEST ==================
app.post("/api/testdb", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const result = await mongoose.connection
      .collection("test")
      .insertOne({ name });

    res.json({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (err) {
    console.error("❌ DB Test Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================== HEALTH ==================
app.get("/", (req, res) => {
  res.send("✅ AI Interview Bot Backend is running successfully!");
});

// ================== GLOBAL ERROR ==================
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================== START ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});