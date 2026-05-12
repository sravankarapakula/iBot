// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BarChart2,
  MessageCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  X,
} from "lucide-react";

import AnoAI from "@/components/ui/animated-shader-background";
import FloatingChat from "../components/FloatingChat.jsx";


export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed]         = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  // Framer-motion variant controls sidebar width only
  const sidebarVariants = {
    expanded:  { width: "15rem" },   // 240px
    collapsed: { width: "4.5rem" },  // 72px
  };

  const navItems = [
    { name: "Dashboard", icon: <BarChart2 size={20} />,     path: "/dashboard" },
    { name: "Chat",      icon: <MessageCircle size={20} />, path: "/chat"      },
    { name: "Profile",   icon: <User size={20} />,          path: "/profile"   },
    { name: "Home",      icon: <Home size={20} />,          path: "/home"      },
  ];

  return (
    /*
     * Root: h-screen + overflow-hidden → viewport-locked, no document scroll.
     * flex row → sidebar and main sit side-by-side as natural siblings.
     * This is the ONLY correct way to get "center relative to remaining width".
     */
    <div className="h-screen overflow-hidden flex text-gray-100 bg-black relative">

      {/* ── Fixed background (behind everything) ── */}
      <AnoAI />

      {/* ══════════════════════════════════════════════════════════════
          SIDEBAR — flex sibling, NOT position:fixed
          Width is controlled by framer-motion variants.
          flex-shrink-0 prevents it from being compressed.
          h-screen + overflow-y-auto → sidebar has its own scroll.
      ══════════════════════════════════════════════════════════════ */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="relative z-20 flex-shrink-0 flex flex-col h-screen
                   border-r border-white/10 bg-black/25 backdrop-blur-md shadow-2xl"
      >
        {/* ── TOP: Brand + Nav (scrollable if nav overflows) ── */}
        <div className="flex flex-col flex-1 overflow-y-auto min-h-0">

          {/* Brand / collapse toggle */}
          <div className={`flex items-center px-3 py-5 border-b border-white/10 shrink-0
                          ${isCollapsed ? "justify-center" : "justify-between"}`}>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[15px] font-bold text-blue-400 cursor-pointer leading-tight"
                onClick={() => navigate("/dashboard")}
              >
                Interview<br />Companion
              </motion.h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md hover:bg-white/10 text-gray-300 transition-colors shrink-0"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Nav items */}
          <nav className="mt-3 flex flex-col space-y-1 px-2">
            {navItems.map((item, idx) => (
              <motion.button
                key={idx}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-3 text-sm rounded-lg
                            transition-all duration-200
                            ${isActive(item.path)
                              ? "bg-blue-500/20 text-blue-300 border-r-2 border-blue-400"
                              : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}
                            ${isCollapsed ? "justify-center" : ""}`}
              >
                {item.icon}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* ── BOTTOM: Sign Out — always pinned, never scrolls away ── */}
        <div className="shrink-0 border-t border-white/10 mx-2 py-2">
          <motion.button
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex items-center gap-3 px-3 py-3 text-sm text-red-400
                        hover:bg-red-500/10 rounded-lg w-full transition-colors
                        ${isCollapsed ? "justify-center" : ""}`}
          >
            <LogOut size={20} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* ══════════════════════════════════════════════════════════════
          MAIN — flex:1 means "all remaining width after sidebar".
          display:flex + justify-content:center centers content
          relative to exactly that remaining space, not the full screen.
          h-screen + overflow-y-auto → only this region scrolls.
      ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10
                       flex flex-col items-center">
        {/*
         * Content wrapper:
         *   w-full   → fills available width
         *   max-w-5xl → caps at 1024px so it doesn't stretch on ultra-wide screens
         *   flex-1   → pushes footer to bottom
         * Each page's own max-width/mx-auto keeps the final content tight.
         */}
        <div className="w-full max-w-5xl flex-1 px-6 py-8">
          <Outlet />
        </div>

        <footer className="w-full max-w-5xl text-center py-4 text-xs text-gray-600 border-t border-white/5">
          © {new Date().getFullYear()} Interview Companion. All rights reserved.
        </footer>
      </main>

      {/* ── Logout Confirmation Modal ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-8 w-80 text-center relative"
            >
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold mb-3 text-white">Confirm Logout</h2>
              <p className="text-gray-400 mb-6 text-sm">Are you sure you want to log out?</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating iBot Chat ── */}
      <FloatingChat />
    </div>
  );
}
