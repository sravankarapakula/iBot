import React from "react";
import { motion } from "framer-motion";
import { UserCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatBot from "../components/ChatBot";

export default function HRRound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-gray-500 hover:text-rose-500 transition"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <UserCheck className="text-rose-600 w-12 h-12" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">HR Round</h1>
          <p className="text-gray-600 mb-6">
            Prepare for personality, attitude, and company-fit questions.
          </p>

          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-8 text-left">
            <h2 className="text-lg font-semibold text-rose-700 mb-2">Typical Topics:</h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Tell me about yourself</li>
              <li>Why do you want to join this company?</li>
              <li>Strengths & weaknesses</li>
              <li>Career goals & salary expectations</li>
            </ul>
          </div>

          <motion.button
            onClick={() => navigate("/chat", { state: { context: "hr" } })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90"
          >
            Start HR Practice
          </motion.button>
        </div>
      </div>
    </div>
  );
}
