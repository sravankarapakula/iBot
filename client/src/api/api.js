const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ Upload resume and get AI insights
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch(`${API_BASE}/api/resume/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to upload resume");
  return response.json();
}

// ✅ Generate interview questions (uses resume + JD)
export async function generateInterviewQuestions(jobDescription, resumeText) {
  const response = await fetch(`${API_BASE}/api/interview/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobDescription, resumeText }),
  });

  if (!response.ok) throw new Error("Failed to generate questions");
  return response.json();
}
