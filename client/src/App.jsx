// src/App.jsx
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// ✅ IMPORTANT: Interview session page (where AI questions should appear)
import InterviewSession from "./pages/InterviewSession.jsx";

import MainLayout from "./layouts/MainLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import ChatBot from "./components/ChatBot.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Interview from "./pages/Interview.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import UploadResume from "./pages/UploadResume.jsx";
import ResumeAnalysis from "./pages/ResumeAnalysis.jsx";
import Profile from "./pages/Profile.jsx";

// Rounds
import TechnicalRound from "./pages/TechnicalRound.jsx";
import ManagerialRound from "./pages/ManagerialRound.jsx";
import HRRound from "./pages/HRRound.jsx";
import StackSelect from "./pages/StackSelect.jsx";
import InterviewAV from "./pages/InterviewAV.jsx";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ✅ DEFAULT REDIRECT */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* ✅ PUBLIC ROUTES */}
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* 🔒 PROTECTED ROUTES */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* 💬 Chat manual page ONLY when user clicks Chat in sidebar */}
          <Route path="/chat" element={<ChatBot />} />

          {/* 💼 Role-First Flow */}
          <Route path="/stacks/:roleId" element={<StackSelect />} />

          {/* 📄 Resume Flow */}
          <Route path="/uploadresume/:title" element={<UploadResume />} />
          <Route path="/resumeanalysis/:roleTitle" element={<ResumeAnalysis />} />

          /* =====================================================
             ✅ INTERVIEW SESSION (REAL AI MOCK INTERVIEW PAGE)
             ResumeAnalysis buttons MUST navigate to this route
          ===================================================== */
          <Route path="/interview-session/:roundType" element={<InterviewSession />} />
          <Route path="/interview-av" element={<InterviewAV />} />


          {/* ❌ These are static intro pages only */}
          <Route path="/technical" element={<TechnicalRound />} />
          <Route path="/managerial" element={<ManagerialRound />} />
          <Route path="/hr" element={<HRRound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

/* ======================== ROUTE MAP ========================
PUBLIC:
  /home        → Landing page
  /login       → Login (PublicRoute — redirects to /dashboard if logged in)
  /signup      → Signup (PublicRoute — redirects to /dashboard if logged in)

PROTECTED (requires sessionStorage authToken):
  /dashboard                     → Role selection grid (Layer 1)
  /stacks/:roleId                → Stack selection for role (Layer 2)
  /uploadresume/:title           → Resume upload + AI analysis
  /resumeanalysis/:roleTitle     → Resume analysis results
  /interview-session/:roundType  → AI mock interview (Technical/Managerial/HR)
  /technical                     → Technical round intro
  /managerial                    → Managerial round intro
  /hr                            → HR round intro
  /profile                       → User profile (reads from sessionStorage + /api/auth/me)
  /chat                          → Free AI chat

AUTH FLOW:
  Login/Signup → stores authToken, refreshToken, user in sessionStorage
  ProtectedRoute checks sessionStorage.authToken
  PublicRoute blocks logged-in users from login/signup
  Logout clears sessionStorage → navigate /login

NEW ROLE-FIRST FLOW ✅:
  /dashboard (pick role) → /stacks/:roleId (pick stack) →
  /uploadresume/:title (upload + analysis) → /interview-session/:round
============================================================== */