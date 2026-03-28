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

          {/* 📄 Resume Flow */}
          <Route path="/uploadresume/:title" element={<UploadResume />} />
          <Route path="/resumeanalysis/:roleTitle" element={<ResumeAnalysis />} />

          /* =====================================================
             ✅ INTERVIEW SESSION (REAL AI MOCK INTERVIEW PAGE)
             ResumeAnalysis buttons MUST navigate to this route
          ===================================================== */
          <Route path="/interview-session/:roundType" element={<InterviewSession />} />


          {/* ❌ These are static intro pages only */}
          <Route path="/technical" element={<TechnicalRound />} />
          <Route path="/managerial" element={<ManagerialRound />} />
          <Route path="/hr" element={<HRRound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

/* ======================== IMPORTANT ========================
WHY YOU WERE REDIRECTED TO CHAT ❌
------------------------------------------------------------
1. Your InterviewSession route was missing OR mismatched.
2. Some buttons were navigating to /chat instead of /interview-session.
3. Sidebar Chat is separate and should not be used for interview.

NOW FLOW IS ✅:
Dashboard → Upload Resume → Resume Analysis →
Click Technical/Managerial/HR → /interview-session ✅
AI questions appear there ✅

Chat page is ONLY for free chat.
============================================================== */