const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Auth header helper (reads token from sessionStorage, matching Login.jsx) ─
function getAuthHeader() {
  const token = sessionStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to safely parse JSON response
async function parseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text || "Server returned an invalid response" };
  }
}

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

// ✅ Generate interview questions (role + round)
export async function generateInterviewQuestions(role, round) {
  const response = await fetch(`${API_BASE}/api/interview/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ role, round }),
  });

  if (!response.ok) throw new Error("Failed to generate questions");
  return response.json();
}

// ✅ Login user — sends credentials to backend, returns token + user
export async function loginUser(email, password) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    throw new Error("Cannot connect to server. Make sure the backend is running on port 5000.",err);
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
}

// ✅ Register user — creates account, returns token + user
export async function registerUser(username, email, password) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
  } catch (err) {
    throw new Error("Cannot connect to server. Make sure the backend is running on port 5000.",err);
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
}

// ────────────────────────────────────────────────────────────────────────────
// ✅ Role-first Selection Flow APIs
// ────────────────────────────────────────────────────────────────────────────

// GET /api/roles — fetch all predefined roles (public)
export async function getRoles() {
  const response = await fetch(`${API_BASE}/api/roles`);
  if (!response.ok) throw new Error("Failed to fetch roles");
  return response.json();
}

// GET /api/roles/:roleId/stacks — fetch stacks for a given role (public)
export async function getStacksForRole(roleId) {
  const response = await fetch(`${API_BASE}/api/roles/${roleId}/stacks`);
  if (!response.ok) throw new Error(`Failed to fetch stacks for role: ${roleId}`);
  return response.json();
}

// POST /api/roles/selection — persist a user's role + stack choice (auth)
export async function saveUserSelection(userId, roleId, stackId, roleName = "", stackName = "") {
  const response = await fetch(`${API_BASE}/api/roles/selection`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ userId, roleId, stackId, roleName, stackName }),
  });
  if (!response.ok) throw new Error("Failed to save user selection");
  return response.json();
}

// GET /api/auth/me — verify token and get current user from server (auth)
export async function getCurrentUser() {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) throw new Error("Session expired");
  return response.json(); // { user: { _id, username, email } }
}
