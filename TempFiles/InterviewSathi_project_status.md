# InterviewSathi — Complete Project Status (as of 2026-04-15)

## 1. Project Overview

**InterviewSathi** (also branded internally as "Interview Companion") is a full-stack AI-powered mock interview preparation web application. Users can:
- Select the job **role** they are targeting (Frontend Engineer, Data Scientist, DevOps, etc.)
- Pick a **technology stack** specialization within that role
- Upload their **resume** to get an AI-powered match score, keyword gap analysis, and suggestions
- Start a **live AI mock interview** (Technical, Managerial, or HR round) that generates 5 questions per session and provides per-answer AI feedback
- Chat with a persistent **floating AI assistant** (iBot) at any time while in the app

---

## 2. Tech Stack

### Frontend (`/client`)
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 7 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v3 (utility classes throughout all JSX) |
| Animations | Framer Motion v12 |
| Icons | Lucide React |
| PDF export | jsPDF |
| PDF parsing (client-side) | pdfjs-dist v5 |
| Charts | Recharts |
| Particles background | react-tsparticles + tsparticles |
| 3D layer | Three.js |
| Firebase | configured (`firebase.js`) — appears to be for auth option (not currently active in main auth flow) |
| Auth | JWT stored in `sessionStorage` (`authToken`, `refreshToken`, `user` keys) |

### Backend (`/server`)
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express v5 |
| Database | MongoDB (via Mongoose v8) |
| AI (LLM) | Groq API (`llama-3.1-8b-instant`), accessed via OpenAI-compatible SDK |
| File upload | Multer v2 |
| PDF parsing (server-side) | pdf-parse, pdf2json |
| Auth | JWT (access + refresh token) via `jsonwebtoken`, passwords hashed with `bcryptjs` |
| Dev server | Nodemon |

### Monorepo
```
InterviewSathi/
  package.json          ← root (no scripts, just a workspace marker)
  client/               ← Vite + React frontend
  server/               ← Express + MongoDB backend
  AV/                   ← (asset/video directory — contents not examined)
  TempFiles/            ← temporary files
```

---

## 3. Environment Variables

### `server/.env` (structure)
```
MONGO_URI=<mongodb connection string>
ACCESS_TOKEN_SECRET=<jwt secret>
ACCESS_TOKEN_EXPIRY=<e.g. 1d>
REFRESH_TOKEN_SECRET=<jwt refresh secret>
REFRESH_TOKEN_EXPIRY=<e.g. 7d>
GROQ_API_KEY=<groq api key>
PORT=5000
```

### `client/.env`
```
VITE_API_URL=http://localhost:5000
```
(The `FloatingChat` component reads `import.meta.env.VITE_API_URL || "http://localhost:5000"`. Other pages hard-code `http://localhost:5000` directly — **this is a known inconsistency**.)

---

## 4. Running the Project

- **Backend:** `cd server && npm run dev` → starts on `http://localhost:5000` (nodemon)
- **Frontend:** `cd client && npm run dev` → starts at `http://localhost:5173` (Vite)

CORS in `server.js` allows `http://localhost:<any port>` and the production URL `https://ai-interview-bot.vercel.app`.

---

## 5. Database Models

### `User` (`server/src/models/user.model.js`)
```js
{
  username: String (required, unique, lowercase, trim),
  email:    String (required, unique, lowercase, trim),
  password: String (required, bcrypt hashed on save),
  refreshToken: String,
  createdAt, updatedAt  // via timestamps: true
}

// Methods:
isPasswordCorrect(password)   → bcrypt.compare
generateAccessToken()         → jwt.sign({ _id }, ACCESS_TOKEN_SECRET, expiry)
generateRefreshToken()        → jwt.sign({ _id }, REFRESH_TOKEN_SECRET, expiry)
```

### `UserSelection` (`server/src/models/userSelection.model.js`)
```js
{
  userId:    String (required),
  roleId:    String (required),
  stackId:   String (required),
  roleName:  String,
  stackName: String,
  selectedAt: Date (default: Date.now)
}
```
Stores which role+stack a user chose; used to persist user flows.

---

## 6. Backend API Routes

All routes served from `http://localhost:5000`.

### Auth — `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user. Returns `{user, authToken, refreshToken}` |
| POST | `/api/auth/login` | Login. Returns `{user, authToken, refreshToken}` |
| GET | `/api/auth/me` | Protected — returns `{user}` from JWT |

> **Auth middleware (`protect`):** Reads `Authorization: Bearer <token>` header, verifies with `ACCESS_TOKEN_SECRET`, attaches `User` document to `req.user`.

### Interview — `/api/interview`
| Method | Path | Payload | Description |
|--------|------|---------|-------------|
| POST | `/api/interview/generate` | `{role, round}` | Calls Groq → 5 questions, returned as string array |
| POST | `/api/interview/evaluate` | `{question, answer}` | Calls Groq → short constructive feedback string |

AI model: `llama-3.1-8b-instant`. **No authentication guard on these routes.**

### Resume — `/api/resume`
| Method | Path | Payload | Description |
|--------|------|---------|-------------|
| POST | `/api/resume/upload` | multipart/form-data: `resume` (file), `role`, optional `stackId`, `stackName` | Parses uploaded PDF/DOCX (`parseResume` util), sends text to Groq, returns JSON `{matchScore, missingKeywords, opinion, suggestions}`. Uploaded file is deleted after parsing. |

### Roles (static data) — `/api/roles`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/roles` | Returns all 8 predefined roles |
| GET | `/api/roles/:roleId/stacks` | Returns stacks filtered by roleId |
| POST | `/api/roles/selection` | Saves a user's role+stack choice to DB |
| GET | `/api/roles/selection/:userId` | Fetches the latest saved selection for a user |

**Note:** Role/stack data is hard-coded in `roleRoutes.js` and mirrors the client-side constants in `client/src/constants/rolesData.js`. The frontend does NOT call these API endpoints for reading roles or stacks — it uses the local constants directly.

### AI Chat (inline in `server.js`) — `/api/chat`
| Method | Path | Payload | Description |
|--------|------|---------|-------------|
| POST | `/api/chat` | `{message}` OR `{messages: [{role, content},...]}` | Groq llama-3.1-8b-instant, max_tokens=130, returns `{reply}` |

---

## 7. Client-Side Architecture

### Entry Point
- `client/index.html` → mounts React app
- `client/src/main.jsx` → wraps `<App />` in `<BrowserRouter>`
- `client/src/App.jsx` → defines all routes

### Route Map (App.jsx)

```
/           → Navigate to /home (redirect)

PUBLIC (no auth required):
  /home     → <Home />          (landing page)
  /signup   → <PublicRoute><Signup /></PublicRoute>
  /login    → <PublicRoute><Login /></PublicRoute>

PROTECTED (requires sessionStorage.authToken):
  Wrapped in <ProtectedRoute><MainLayout /></ProtectedRoute>
    /dashboard               → <Dashboard />       (Layer 1: Role selection)
    /profile                 → <Profile />
    /chat                    → <ChatBot />          (dedicated chat page)
    /stacks/:roleId          → <StackSelect />      (Layer 2: Stack selection)
    /uploadresume/:title     → <UploadResume />     (Layer 3: Upload + AI analysis)
    /resumeanalysis/:roleTitle → <ResumeAnalysis /> (alternative analysis page)
    /interview-session/:roundType → <InterviewSession />  (MAIN interview page)
    /technical               → <TechnicalRound />  (static intro page only)
    /managerial              → <ManagerialRound /> (static intro page only)
    /hr                      → <HRRound />         (static intro page only)
```

### Route Guards
- **`ProtectedRoute`** — checks `sessionStorage.getItem("authToken")`. If falsy, clears all sessionStorage and redirects to `/login`.
- **`PublicRoute`** — checks `sessionStorage.getItem("authToken")`. If present (user already logged in), redirects to `/dashboard`. Prevents back-navigation to login/signup.

### Auth Flow
1. On login/signup, server returns `{user, authToken, refreshToken}`.
2. Client stores: `sessionStorage.setItem("authToken", ...)`, `sessionStorage.setItem("refreshToken", ...)`, `sessionStorage.setItem("user", JSON.stringify(user))`.
3. On logout: `sessionStorage.clear()` → navigate to `/login`.
4. `Profile.jsx` reads from sessionStorage first, then verifies with `GET /api/auth/me` sending `Authorization: Bearer <authToken>`.

---

## 8. Layouts

### `MainLayout.jsx`
- **Viewport-locked** layout: `h-screen overflow-hidden flex` prevents document scroll.
- **Sidebar** (left): Framer Motion animated, collapsible (expanded = 15rem, collapsed = 4.5rem). Nav items: Dashboard, Chat, Profile, Home. Logout button at bottom with confirmation modal.
- **Main area** (right): `flex-1 h-screen overflow-y-auto` — only this region scrolls. Content is centered with `max-w-5xl`.
- **Background**: `<AnoAI />` (animated shader background component from `@/components/ui/animated-shader-background`).
- **Floating iBot**: `<FloatingChat />` rendered globally within layout.

### `AuthLayout.jsx`
- Minimal wrapper for Login / Signup pages (separate from MainLayout).

---

## 9. Pages — Detailed Status

### `Home.jsx` (~9 KB)
Landing page. Public. No auth required. Contains hero section, feature highlights, CTA buttons to signup/login.

### `Login.jsx` (~8 KB)
- Form: email + password.
- Calls `POST /api/auth/login`.
- On success: stores `authToken`, `refreshToken`, `user` in sessionStorage → navigates to `/dashboard`.
- Wrapped in `PublicRoute` (redirects away if already logged in).

### `Signup.jsx` (~11 KB)
- Form: username + email + password.
- Calls `POST /api/auth/register`.
- On success: same sessionStorage storage → navigates to `/dashboard`.
- Wrapped in `PublicRoute`.

### `Dashboard.jsx` (~22 KB) — Layer 1
- Displays a **role selection grid** grouped by category (Engineering, Data & AI, Infrastructure, Design).
- 8 predefined roles from `client/src/constants/rolesData.js`.
- Features:
  - **Search** by title or category.
  - **3-step progress breadcrumb** (Role → Stack → Resume), step 1 active.
  - **RoleTile** sub-component: glassmorphism cards with gradient background, category badge, (i) info button, chevron arrow.
  - **(i) Info button** → opens `<InfoModal>` with detailed role info.
  - **"Add New Role" button** → opens modal to define a custom role with ID, title, description, category, color picker, and optional stacks.
  - Custom roles are stored only in React state (in-memory, not persisted to DB or localStorage).
  - Clicking a role tile navigates to `/stacks/:roleId` passing role object and any custom stacks as React Router state.

### `StackSelect.jsx` (~19 KB) — Layer 2
- Displays technology stacks for the selected role.
- Receives `role` and `customStacks` from React Router `location.state`.
- Loads predefined stacks from `PREDEFINED_STACKS` constant filtered by `roleId`.
- Features:
  - **3-step breadcrumb** (step 2 active, step 1 checked).
  - **StackTile** sub-component: gradient cards with tool chip pills, tags, (i) info button.
  - **(i) Info button** → opens `<InfoModal>` with stack details (tools, tags, description).
  - **"Add New Stack" button** → modal to add a custom stack for this role (in-memory only).
  - Selecting a stack: calls `saveUserSelection()` from `services/api.js` to `POST /api/roles/selection` (silently skips on error), then navigates to `/uploadresume/:roleTitle` passing `{role, stack}` as state.

### `UploadResume.jsx` (~10 KB) — Layer 3 (PRIMARY RESUME FLOW)
- Receives `role` (title string) from URL param and `stack` from state.
- Shows role + stack title in header.
- File picker: accepts `.pdf`, `.doc`, `.docx`.
- On submit: POSTs multipart form to `POST /api/resume/upload` (backend handles parsing + Groq AI analysis).
- **After analysis**, displays:
  - Match score (0–100%)
  - AI Opinion (short professional opinion)
  - Missing keywords (red chip pills)
  - Suggestions for improvement (bulleted list)
  - **Download Report** (PDF via jsPDF)
  - **Change Resume** (reset)
  - Round selection buttons: Technical, Managerial, HR → navigate to **static intro pages** (`/technical`, `/managerial`, `/hr`) — **⚠️ BUG: these are the wrong targets**
  - **"🚀 Start AI Interview"** → navigates to `/interview-session/technical` with `{role: roleTitle, resumeText}` — this is the correct path.

> **Known issue:** The three round buttons (Technical, Managerial, HR) in `UploadResume.jsx` navigate to `/technical`, `/managerial`, `/hr` (static intro pages) instead of `/interview-session/technical`, `/interview-session/managerial`, `/interview-session/hr`. Only the "Start AI Interview" button goes to the correct `InterviewSession` page, but it hard-codes `technical` as the round type and doesn't pass the round for the correct type.

### `ResumeAnalysis.jsx` (~6 KB) — ALTERNATIVE ANALYSIS PAGE
- Route: `/resumeanalysis/:roleTitle`
- A **separate, older analysis page** that does client-side PDF extraction using `pdfjs-dist` (no backend call for parsing).
- Analysis logic is a simple **hardcoded keyword match** (not AI): checks for "react", "javascript", "lead" etc. in resume text.
- `startInterview(roundType)` correctly navigates to `/interview-session/:roundType` with role, resumeText, and round in state.
- **Status:** This page exists as an alternative; the `UploadResume.jsx` route is the primary/recommended path (uses real Groq AI). `ResumeAnalysis.jsx` is not directly linked from the main flow anymore.

### `InterviewSession.jsx` (~11 KB) — THE MAIN INTERVIEW PAGE
- Route: `/interview-session/:roundType`
- Receives `{role, round}` from `location.state` (handles both string and object `role`).
- **On mount:** calls `POST /api/interview/generate` with `{role, round}` → gets 5 questions.
- Displays questions one at a time with:
  - Progress bar across 5 questions.
  - Round color-coded header (Technical=blue-purple, Managerial=purple-pink, HR=pink-rose).
  - Large textarea for answer input; Ctrl+Enter to submit.
  - **Submit Answer** → calls `POST /api/interview/evaluate` with `{question, answer}` → shows AI feedback in an emerald card.
  - **Skip / Next** → moves to next question (skips evaluation).
  - After final question, navigates back to `/dashboard`.
- **Hard-codes** `http://localhost:5000` for API calls (not using `VITE_API_URL`).

### `Profile.jsx` (~7 KB)
- Route: `/profile`
- Reads user from sessionStorage first.
- Calls `GET /api/auth/me` (with `Authorization: Bearer authToken`) to verify and refresh user data.
- Displays: avatar (DiceBear initials), username, email, user ID, account status, session type.
- "Resume Analysis History" section shows a placeholder ("No analyses yet") — **not yet implemented with real data**.
- Buttons: Go to Dashboard, Logout.

### `TechnicalRound.jsx`, `ManagerialRound.jsx`, `HRRound.jsx` (~2 KB each)
- Static intro/description pages for each round type.
- **Do not start the actual interview.** They are informational only.
- Not directly linked from any working flow (only reachable from the buggy buttons in `UploadResume.jsx`).

### `ChatBot.jsx` (~4 KB)
- Route: `/chat` (dedicated full-page chat)
- Separate from `FloatingChat.jsx`.
- A standalone chat interface for users who click "Chat" in the sidebar.

---

## 10. Key Components

### `FloatingChat.jsx` (~19 KB) — iBot
- Persistent floating AI chat widget, rendered globally inside `MainLayout`.
- Fixed position: bottom-right (`right: 22px, bottom: 22px`).
- **State:** open, minimized, or closed. Closing resets conversation.
- **Active dot + pulse ring** shown when minimized with an active session.
- Sends last 6 messages as context to `POST /api/chat` (Groq, max_tokens=130).
- 1.5s send cooldown to prevent spam.
- Uses a `messagesRef` + `useEffect` pattern to avoid stale closure issues.
- Welcome message is skipped from API context (`_skip: true`).

### `InfoModal.jsx` (~5 KB)
- Reusable modal for showing detailed info about a Role or a Stack.
- Accepts `{item, type ("role"|"stack"), onClose}`.
- For roles: shows title, category, description, and any sub-stacks if present.
- For stacks: shows name, description, key tools (chips), tags.
- Click backdrop or X to close.

### `ProtectedRoute.jsx`
- Checks `sessionStorage.authToken`. Redirects to `/login` if absent.

### `PublicRoute.jsx`
- Checks `sessionStorage.authToken`. Redirects to `/dashboard` if present.

### `NavBar.jsx` (~1 KB)
- Simple top nav (appears to be a legacy/minimal component, main nav is in MainLayout sidebar).

### `ParticlesBg.jsx` (~1 KB)
- tsparticles background component (used on landing/auth pages likely).

### `ScoreCard.jsx` (~1 KB)
- Reusable score card UI component.

### `AnalyticsChart.jsx`
- Stub/placeholder for a Recharts analytics chart.

### `ui/` directory
- Contains shadcn-style UI primitives and custom components:
  - `animated-shader-background` (AnoAI) — used as MainLayout background
  - `dotted-surface` — used on Dashboard and Profile as decorative overlay

---

## 11. Services & Utilities (`client/src/services/`)

### `api.js` (inferred from usage in Profile.jsx and StackSelect.jsx)
- `getCurrentUser()` — `GET /api/auth/me` with `Authorization: Bearer <token>` from sessionStorage. Throws `"Session expired"` if 401.
- `saveUserSelection(userId, roleId, stackId, roleName, stackName)` — `POST /api/roles/selection`.

---

## 12. Constants (`client/src/constants/rolesData.js`)

Contains the same role and stack data that is also in `roleRoutes.js` on the server. The client uses this directly (no API call needed for browsing roles/stacks). Data includes:

**Roles (8):**
- `FE` — Frontend Engineer (Engineering)
- `BE` — Backend Engineer (Engineering)
- `FS` — Full Stack Developer (Engineering)
- `DS` — Data Scientist (Data & AI)
- `DEV` — DevOps Engineer (Infrastructure)
- `UX` — UI/UX Designer (Design)
- `ML` — ML Engineer (Data & AI)
- `MOB` — Mobile Developer (Engineering)

**Stacks (24 total, 3 per role):**
- FE: React, Angular, Vue.js
- BE: Node.js+Express, Java Spring Boot, Django
- FS: MERN, MEAN, Next.js+PostgreSQL
- DS: scikit-learn, TensorFlow, R+tidyverse
- DEV: AWS+Terraform, GCP+Kubernetes, Azure DevOps
- UX: Figma Web, Figma Mobile, Adobe XD
- ML: PyTorch+MLflow, AWS SageMaker, GCP Vertex AI
- MOB: React Native, Flutter, Swift iOS

---

## 13. Server Services

### `groqService.js`
- Creates a Groq client using `groq-sdk` and `GROQ_API_KEY`.
- Exported as default for use in `openaiService.js`.

### `openaiService.js`
- `generateAIQuestions(role, round)` — prompt: "Generate 5 {round} interview questions for {role}". Returns string array split by newlines.
- `evaluateAIAnswer(question, answer)` — prompt: constructive feedback + improvement tips. Returns plain text.
- `extractResumeInsights(resumeText, role)` — detailed prompt for JSON output: `{matchScore, missingKeywords, opinion, suggestions}`. Uses `response_format: { type: "json_object" }`.

All three functions use `llama-3.1-8b-instant` via Groq.

### `server/src/utils/parseResume.js`
- Utility for server-side file parsing (PDF → text, DOCX → text). Used by `resumeController.js`.

---

## 14. Known Issues & Inconsistencies

1. **Hard-coded API URLs:** `InterviewSession.jsx` and `UploadResume.jsx` hard-code `http://localhost:5000` instead of using the `VITE_API_URL` env variable. Only `FloatingChat.jsx` correctly reads `import.meta.env.VITE_API_URL`.

2. **Wrong navigation from `UploadResume.jsx` after analysis:** The "Technical", "Managerial", "HR" buttons navigate to `/technical`, `/managerial`, `/hr` (static info pages), not to `/interview-session/technical`, etc. Only the "🚀 Start AI Interview" button points to `InterviewSession`, but it always hardcodes `technical` round type and ignores which button was clicked.

3. **`ResumeAnalysis.jsx` duplicates `UploadResume.jsx`:** Two separate resume upload/analysis pages exist. `ResumeAnalysis.jsx` uses client-side keyword matching (not AI); `UploadResume.jsx` uses real Groq AI. `ResumeAnalysis.jsx` is no longer in the main nav flow but the route still exists.

4. **Interview questions are unformatted raw text:** `generateAIQuestions` splits by `\n` but LLM responses often include numbering like `1. What is...` mixed with blank lines — the filter only checks truthy, so numbered question lines pass through (acceptable), but the quality depends on Groq's formatting behavior.

5. **No resume history persistence:** Profile page shows "No analyses yet" placeholder. Resume analysis results are not saved to DB after analysis.

6. **Custom roles/stacks are session-only:** Dashboard and StackSelect allow adding custom roles/stacks, but these are stored only in React state. They disappear on page refresh or navigation.

7. **Firebase is configured but not used:** `client/src/firebase.js` initializes Firebase, but auth is entirely JWT-based through the custom backend. Firebase may be a leftover or future plan.

8. **`ResumeAnalysis` route is unused in main flow:** The route `/resumeanalysis/:roleTitle` exists but is not navigated to from any active component. Could be cleaned up.

9. **No token refresh logic:** If the access token expires, the app will fail silently on protected API calls. There is no interceptor to use the `refreshToken` to get a new `accessToken`.

---

## 15. User Journey (Happy Path)

```
1. User visits /home → sees landing page
2. User clicks Sign Up → /signup → fills form → POST /api/auth/register
   → sessionStorage gets authToken + user → redirect to /dashboard

3. /dashboard → sees 8 role tiles grouped by category
   → searches / reads info modal (i) → clicks a role tile

4. /stacks/:roleId → sees 3 stacks for that role
   → reads info modal → clicks a stack tile
   → (optionally) POST /api/roles/selection saves selection to DB

5. /uploadresume/:roleTitle → upload PDF/DOCX
   → POST /api/resume/upload → Groq analyzes
   → sees matchScore, missingKeywords, opinion, suggestions
   → clicks "🚀 Start AI Interview"

6. /interview-session/technical → 5 Groq-generated questions
   → types answer per question → "Submit Answer" → Groq evaluates → shows feedback
   → presses "Skip →" or moves to next after feedback
   → after Q5: navigate back to /dashboard

7. At any point in protected area: FloatingChat (iBot) is available
   bottom-right for quick AI advice on roles, stacks, resume
```

---

## 16. What Is NOT Yet Built / Placeholder

- **Interview history / session persistence** — no DB table for storing session results
- **Resume analysis history** — Profile page shows placeholder
- **Token refresh** — no refresh token usage on expiry
- **Real analytics/charts** — `AnalyticsChart.jsx` is a stub
- **Firebase auth** — configured but not integrated
- **Email verification / password reset** — not implemented
- **Deployment config** — Vercel URL in CORS suggests deployment is planned, but no CI/CD or build pipeline configured in repo
