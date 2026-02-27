import React from "react";
import { motion } from "framer-motion";
import { Briefcase, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatBot from "../components/ChatBot";

export default function ManagerialRound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-gray-500 hover:text-amber-500 transition"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <Briefcase className="text-amber-600 w-12 h-12" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Managerial Round</h1>
          <p className="text-gray-600 mb-6">
            Test your leadership, decision-making, and project management skills.
          </p>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-left">
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Focus Areas:</h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Team management & conflict resolution</li>
              <li>Handling deadlines & resources</li>
              <li>Communication & planning</li>
              <li>Scenario-based problem solving</li>
            </ul>
          </div>

          <motion.button
            onClick={() => navigate("/chat", { state: { context: "managerial" } })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
          >
            Start Managerial Practice
          </motion.button>
        </div>
      </div>
    </div>
  );
}
