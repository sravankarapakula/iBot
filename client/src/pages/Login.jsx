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

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email format.";
    if (!password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ✅ NORMAL LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const userData = {
        name: email.split("@")[0],
        email: email,
        photo: ""
      };

      localStorage.setItem("authToken", "sample_token_123");
      localStorage.setItem("user", JSON.stringify(userData)); 

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.message);
      setErrors({ general: "Login failed. Please try again." });
    }
  };

  // ✅ SOCIAL LOGIN (GOOGLE / FACEBOOK / APPLE)
  const handleSocialLogin = async (type) => {
    try {
      let userCredential;

      if (type === "Google") userCredential = await signInWithGoogle();
      if (type === "Facebook") userCredential = await signInWithFacebook();
      if (type === "Apple") userCredential = await signInWithApple();

      const user = userCredential.user;

      const userData = {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      };

      localStorage.setItem("authToken", `${type}_login_token`);
      localStorage.setItem("user", JSON.stringify(userData)); 

      navigate("/dashboard");
    } catch (err) {
      console.error("Social login error:", err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-gradient-to-br from-teal-50 via-white to-cyan-50">

      <Particles
        id="tsparticles"
        className="absolute inset-0 z-0"
        init={async (engine) => await loadFull(engine)}
        options={{
          background: { color: "transparent" },
          fpsLimit: 60,
          particles: {
            color: { value: "#14B8A6" },
            links: { color: "#14B8A6", distance: 120, enable: true, opacity: 0.4 },
            move: { enable: true, speed: 1 },
            number: { value: 60, density: { enable: true, area: 800 } },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
        }}
      />

      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 py-4 z-10">
        <h1 className="text-teal-700 font-bold text-2xl">Interview Companion</h1>
        <button
          onClick={() => navigate("/")}
          className="text-teal-700 hover:text-teal-900 transition"
        >
          <X size={28} />
        </button>
      </header>

      <div className="relative z-10 w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-10 border border-blue-100 mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LOGIN FORM */}
        <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h2 className="text-3xl font-bold text-teal-700 mb-4">
            Welcome Back
          </h2>

          <form className="grid grid-cols-1 gap-5" onSubmit={handleSubmit}>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-xl"
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl"
            >
              Log In
            </button>
          </form>
        </motion.div>

        {/* SOCIAL LOGIN */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <h3>Or continue with</h3>

          {["Google", "Facebook", "Apple"].map((provider) => (
            <button
              key={provider}
              onClick={() => handleSocialLogin(provider)}
              className="w-full border rounded-xl py-3"
            >
              Continue with {provider}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
