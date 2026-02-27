import React from "react";
import { motion } from "framer-motion";
import { Code, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ChatBot from "../components/ChatBot";

export default function TechnicalRound() {
  const navigate = useNavigate();
  const { roleTitle } = useParams();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-gray-500 hover:text-blue-500 transition"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <Code className="text-blue-600 w-12 h-12" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Technical Round</h1>
          <p className="text-gray-600 mb-6">
            Prepare for your technical interview for <span className="font-semibold text-blue-600">{roleTitle}</span> role.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">Common Topics:</h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Data Structures & Algorithms</li>
              <li>React / JavaScript fundamentals</li>
              <li>API design & database handling</li>
              <li>Problem-solving & debugging</li>
            </ul>
          </div>

          <motion.button
            onClick={() => navigate("/chat", { state: { context: "technical" } })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
          >
            Start Technical Practice
          </motion.button>
        </div>
      </div>
    </div>
  );
}
