// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Loader2, FileText, Layers, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";
import { DottedSurface } from "@/components/ui/dotted-surface";

export default function Profile() {
  const navigate = useNavigate();

  // ── Pull stored user from sessionStorage (set by Login / Signup) ────────────
  const storedUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const [user, setUser]       = useState(storedUser);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Verify session with backend GET /api/auth/me ────────────────────────────
  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        // Merge fresh data from server (data.user) with stored data
        setUser((prev) => ({ ...prev, ...data.user }));
      })
      .catch((err) => {
        console.warn("Profile fetch error:", err.message);
        // If token is invalid, session has expired
        if (err.message === "Session expired") {
          setError("Your session has expired. Please log in again.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-400" size={36} />
      </div>
    );
  }

  // Derive display values — backend stores username, not name
  const displayName  = user?.username || user?.name || "User";
  const displayEmail = user?.email    || "—";
  const userId       = user?._id;

  // Avatar from DiceBear using username as seed
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=3b4fd8&textColor=ffffff`;

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center relative z-0 bg-transparent">
      <DottedSurface />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-5 relative z-10"
      >

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2"
          >
            <Shield size={16} /> {error}
            <button
              onClick={handleLogout}
              className="ml-auto text-red-400 underline hover:text-red-300 text-xs"
            >
              Log in again
            </button>
          </motion.div>
        )}

        {/* Profile Card */}
        <div className="bg-black/60 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-8">

          {/* Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-24 h-24 rounded-full border-4 border-indigo-500/40 shadow-lg shrink-0"
            />
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <User size={22} className="text-indigo-400" />
                {displayName}
              </h1>
              <p className="text-gray-300 flex items-center gap-1.5 mt-1.5 text-sm">
                <Mail size={14} className="text-indigo-300" />
                {displayEmail}
              </p>
              {userId && (
                <p className="text-gray-600 text-xs mt-1 font-mono">
                  UID: {userId}
                </p>
              )}
            </div>
          </div>

          {/* Account Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <InfoCard label="Username" value={displayName} icon={<User size={14} />} />
            <InfoCard label="Email" value={displayEmail} icon={<Mail size={14} />} />
            <InfoCard
              label="Account Status"
              value="Active"
              icon={<Shield size={14} />}
              accent="text-emerald-400"
            />
            <InfoCard
              label="Session"
              value="JWT (Bearer Token)"
              icon={<Shield size={14} />}
              accent="text-blue-400"
            />
          </div>

          {/* Resume analysis history placeholder */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-blue-100 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-blue-400" />
              Resume Analysis History
            </h2>
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-gray-500 italic text-sm">
                No analyses yet — upload a resume after selecting your role and stack.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/dashboard")}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/30 transition border border-white/10 text-sm"
            >
              <Layers size={16} />
              Go to Dashboard
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-xl transition text-sm"
            >
              <LogOut size={16} />
              Logout
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Reusable info card ────────────────────────────────────────────────────────
function InfoCard({ label, value, icon, accent = "text-gray-300" }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
      <p className="text-gray-500 text-xs mb-1 flex items-center gap-1.5">
        <span className="text-gray-600">{icon}</span>
        {label}
      </p>
      <p className={`text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
