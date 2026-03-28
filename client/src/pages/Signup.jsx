import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnoAI from "../components/ui/animated-shader-background";
import { registerUser } from "../services/api";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required.";
    if (!email.trim()) e.email = "Email is required.";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email format.";
    if (!password) e.password = "Password is required.";
    if (password && password.length < 8) e.password = "Password must be at least 8 characters.";
    if (password !== confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);
  setErrors({});

  try {
    const data = await registerUser(username, email, password);

    // 🔴 STRICT VALIDATION (prevents false navigation)
    if (!data || !data.accessToken) {
      throw new Error("Invalid server response: accessToken missing");
    }

    // ✅ STORE TOKENS SAFELY
    sessionStorage.setItem("authToken", data.accessToken);
    if (data.refreshToken) {
      sessionStorage.setItem("refreshToken", data.refreshToken);
    }

    // ✅ STORE USER SAFELY
    if (data.user) {
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          _id: data.user._id,
          username: data.user.username,
          email: data.user.email,
        })
      );
    }

    // 🔴 FORCE CLEAN NAVIGATION STACK
    navigate("/dashboard", { replace: true });

  } catch (err) {
    setErrors({
      general:
        err.message ||
        err.response?.data?.message ||
        "Registration failed. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Aurora Shader Background */}
      <div className="fixed inset-0 z-0">
        <AnoAI />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 py-5 z-20">
        <Link to="/home" className="text-2xl font-bold tracking-wide text-white hover:text-blue-300 transition">
          Interview Companion
        </Link>
        <Link
          to="/home"
          className="px-4 py-2 rounded border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition text-sm"
        >
          ← Back to Home
        </Link>
      </header>

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mt-20 mb-8"
      >
        <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-8 md:p-10 border border-white/[0.12] shadow-2xl shadow-indigo-500/5">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <User className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-gray-400 text-sm">Start your journey with Interview Companion</p>
          </motion.div>

          {/* General Error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center"
            >
              {errors.general}
            </motion.div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.confirm}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-gray-500">ALREADY A MEMBER?</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full py-3 rounded-xl border border-white/[0.12] text-gray-300 font-medium text-sm hover:bg-white/[0.06] hover:text-white transition flex items-center justify-center gap-2"
          >
            Sign In Instead
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-gray-600 mt-4">
          © {new Date().getFullYear()} Interview Companion. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
