import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

console.log("GROQ KEY LOADED:", process.env.GROQ_API_KEY ? "YES ✅" : "NO ❌");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default groq;
