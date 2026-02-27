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

// ⭐ Import your new 21st.dev component
import AnoAI from "@/components/ui/animated-shader-background";

// ⬆️ Change name if your file is different

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "5rem" },
  };

  const navItems = [
    { name: "Dashboard", icon: <BarChart2 size={20} />, path: "/dashboard" },
    { name: "Chat", icon: <MessageCircle size={20} />, path: "/chat" },
    { name: "Profile", icon: <User size={20} />, path: "/profile" },
    { name: "Home", icon: <Home size={20} />, path: "/home" },
  ];

  return (
    <div className="min-h-screen flex text-gray-100 relative overflow-hidden bg-black">
      {/* Background Component */}
      <AnoAI />

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.4 }}
        className="relative z-20 flex flex-col justify-between fixed left-0 top-0 bottom-0 border-r border-white/10 bg-black/20 backdrop-blur-md shadow-2xl"
      >
        <div>
          <div
            className={`flex items-center justify-between px-4 py-5 border-b border-white/10 ${isCollapsed ? "justify-center" : ""
              }`}
          >
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-blue-400 cursor-pointer"
                onClick={() => navigate("/dashboard")}
              >
                Interview Companion
              </motion.h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md hover:bg-white/10 text-gray-300 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <nav className="mt-4 flex flex-col space-y-1 px-2">
            {navItems.map((item, idx) => (
              <motion.button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-all duration-200 ${isActive(item.path)
                  ? "bg-blue-500/20 text-blue-300 border-r-2 border-blue-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  } ${isCollapsed ? "justify-center" : ""}`}
              >
                {item.icon}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 mb-4 mx-2 pt-2">
          <motion.button
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-md w-full transition-colors ${isCollapsed ? "justify-center" : ""
              }`}
          >
            <LogOut size={20} />
            <AnimatePresence>
              {!isCollapsed && <motion.span>Logout</motion.span>}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Section */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`flex-1 min-h-screen relative z-10 ${isCollapsed ? "ml-20 mr-20" : "ml-64 mr-64"
          } transition-all duration-500 overflow-y-auto`}
      >
        <div className="p-8">
          <Outlet />
        </div>

        <footer className="text-center py-4 text-sm text-gray-500/60">
          © {new Date().getFullYear()} Interview Companion. All rights reserved.
        </footer>
      </motion.main>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-8 w-80 text-center"
            >
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold mb-3 text-white">Confirm Logout</h2>
              <p className="text-gray-400 mb-6">Are you sure you want to log out?</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
