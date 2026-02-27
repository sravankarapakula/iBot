import React, { useState, useEffect } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
} from "../firebase";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileFile) {
      setProfilePreview(null);
      return;
    }
    const url = URL.createObjectURL(profileFile);
    setProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileFile]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((s) => ({ ...s, profile: "Please upload an image file." }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((s) => ({ ...s, profile: "Image must be smaller than 2MB." }));
      return;
    }
    setErrors((s) => ({ ...s, profile: null }));
    setProfileFile(file);
  };

  const removeProfile = () => {
    setProfileFile(null);
    setProfilePreview(null);
  };

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required.";
    if (!email.trim()) e.email = "Email is required.";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Email is invalid.";
    if (!password) e.password = "Password is required.";
    if (password && password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (password !== confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    navigate("/"); // Redirect to Dashboard after signup
  };

  const handleSocialLogin = async (type) => {
    try {
      if (type === "Google") await signInWithGoogle();
      if (type === "Facebook") await signInWithFacebook();
      if (type === "Apple") await signInWithApple();
      navigate("/");
    } catch (err) {
      console.error("Login error:", err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Background Particles */}
      <Particles
        id="tsparticles"
        className="absolute inset-0 z-0"
        init={async (engine) => await loadFull(engine)}
        options={{
          background: { color: "transparent" },
          fpsLimit: 60,
          particles: {
            color: { value: "#14B8A6" },
            links: {
              color: "#14B8A6",
              distance: 130,
              enable: true,
              opacity: 0.4,
              width: 1,
            },
            move: { enable: true, speed: 1 },
            number: { value: 80, density: { enable: true, area: 800 } },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
        }}
      />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 py-4 z-10">
        <h1 className="text-teal-700 font-bold text-2xl tracking-wide">
          Interview Companion
        </h1>
        <button
          onClick={() => navigate("/")}
          className="text-teal-700 hover:text-teal-900 transition"
        >
          <X size={28} />
        </button>
      </header>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-10 border border-blue-100 mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-extrabold text-teal-700 mb-3 text-center md:text-left">
            Create Account
          </h2>
          <p className="text-gray-700 mb-6 text-center md:text-left">
            Start your journey with Interview Companion
          </p>

          <form className="grid grid-cols-1 gap-5" onSubmit={handleSubmit}>
            {/* Profile Upload */}
            <div className="flex flex-col items-center mb-3">
              {profilePreview ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-teal-400 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={removeProfile}
                    className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700"
                  >
                    ✕
                  </button>
                </motion.div>
              ) : (
                <label className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-50 cursor-pointer border-2 border-dashed border-gray-400 hover:border-teal-400 transition">
                  <span className="text-gray-700 text-sm text-center">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
              {errors.profile && (
                <p className="text-sm text-red-500 mt-2">{errors.profile}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="johndoe"
                className="w-full px-5 py-3 rounded-xl border-2 border-black bg-white text-black focus:ring-2 focus:ring-teal-400 outline-none text-base placeholder-gray-500"
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Email Address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="john@example.com"
                className="w-full px-5 py-3 rounded-xl border-2 border-black bg-white text-black focus:ring-2 focus:ring-teal-400 outline-none text-base placeholder-gray-500"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  className="w-full px-5 py-3 rounded-xl border-2 border-black bg-white text-black focus:ring-2 focus:ring-teal-400 outline-none pr-12 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  className="w-full px-5 py-3 rounded-xl border-2 border-black bg-white text-black focus:ring-2 focus:ring-teal-400 outline-none pr-12 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-sm text-red-500 mt-1">{errors.confirm}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-teal-400 hover:to-cyan-400 transition"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-sm text-gray-700 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-600 font-semibold hover:underline"
            >
              Log In
            </Link>
          </p>
        </motion.div>

        {/* Right: Social Login */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-4 border-l border-gray-200 pl-6"
        >
          <h3 className="text-gray-800 font-semibold mb-2">Or continue with</h3>
          <div className="w-full space-y-3">
            {[
              {
                name: "Google",
                icon: "https://www.svgrepo.com/show/355037/google.svg",
              },
              {
                name: "Facebook",
                icon: "https://www.svgrepo.com/show/475647/facebook-color.svg",
              },
              {
                name: "Apple",
                icon: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
              },
            ].map((provider, i) => (
              <motion.button
                key={provider.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                type="button"
                onClick={() => handleSocialLogin(provider.name)}
                className="w-full flex items-center justify-center gap-3 border-2 border-black rounded-xl py-3 bg-white hover:bg-gray-100 transition transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <img src={provider.icon} alt={provider.name} className="w-5 h-5" />
                <span className="text-gray-800 font-medium">{provider.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
