import axios from "axios";

// 👇 Use your environment variable or fall back to localhost (for dev)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 👇 Create axios instance with base URL
const api = axios.create({
  baseURL: `${API_BASE}/api`, // all requests go through /api
  headers: {
    "Content-Type": "application/json",
  },
});

// 👇 Example API call for interview question generation
export async function generateInterviewQuestions(jobDescription, resumeText) {
  try {
    const response = await api.post("/interview/generate", {
      jobDescription,
      resumeText,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error generating questions:", error);
    throw error;
  }
}

export default api;
