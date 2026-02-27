import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function InterviewSession() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // Handle both string (from ResumeAnalysis) and object (from other sources) formats
  const role = typeof state?.role === 'string' ? state.role : (state?.role?.title || "Unknown Role");
  const round = state?.round || "technical";

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, round })
      });

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setIsSubmitting(true);
    setShowFeedback(false);

    try {
      const res = await fetch("http://localhost:5000/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[currentIndex],
          answer
        })
      });

      const data = await res.json();
      setFeedback(data.feedback);
      setShowFeedback(true);
    } catch (error) {
      console.error("Failed to submit answer:", error);
      setFeedback("Failed to get feedback. Please try again.");
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setAnswer("");
      setFeedback("");
      setShowFeedback(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      // Interview completed
      navigate("/dashboard");
    }
  };

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const getRoundColor = () => {
    switch (round.toLowerCase()) {
      case "technical": return "from-blue-500 to-purple-600";
      case "managerial": return "from-purple-500 to-pink-600";
      case "hr": return "from-pink-500 to-rose-600";
      default: return "from-indigo-500 to-purple-600";
    }
  };

  const getRoundIcon = () => {
    switch (round.toLowerCase()) {
      case "technical": return "💻";
      case "managerial": return "📊";
      case "hr": return "👥";
      default: return "📝";
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Background is now provided by MainLayout (AnoAI) */}

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
            >
              <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${getRoundColor()} text-white font-semibold text-sm shadow-lg`}>
                {getRoundIcon()} {round.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 shadow-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {role}
            </h1>
            <p className="text-white/70 text-lg">
              {questions.length > 0 ? `Question ${currentIndex + 1} of ${questions.length}` : "Loading interview..."}
            </p>

            {/* Progress Bar */}
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${getRoundColor()} shadow-lg`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-12 shadow-2xl text-center"
          >
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mb-4"></div>
            <p className="text-white/70 text-lg">Loading your interview questions...</p>
          </motion.div>
        ) : questions.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Question Card */}
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 shadow-2xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {currentIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-white leading-relaxed">
                      {questions[currentIndex]}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Answer Input */}
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 shadow-2xl">
                <label className="block text-white font-semibold mb-4 text-lg">
                  Your Answer
                </label>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      submitAnswer();
                    }
                  }}
                  placeholder="Type your answer here... (Ctrl+Enter to submit)"
                  className="w-full h-48 bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-white/50 text-sm">
                    {answer.length} characters
                  </p>
                  <p className="text-white/50 text-sm">
                    Tip: Press Ctrl+Enter to submit
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim() || isSubmitting}
                  className={`flex-1 sm:flex-none px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${!answer.trim() || isSubmitting
                    ? 'bg-gray-600'
                    : `bg-gradient-to-r ${getRoundColor()} hover:shadow-2xl`
                    }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Evaluating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>✓</span> Submit Answer
                    </span>
                  )}
                </button>

                <button
                  onClick={nextQuestion}
                  className="flex-1 sm:flex-none px-8 py-4 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 shadow-lg transition-all transform hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    {currentIndex < questions.length - 1 ? "Skip →" : "Finish Interview"}
                  </span>
                </button>
              </div>

              {/* Feedback Section */}
              <AnimatePresence>
                {showFeedback && feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/30 p-8 shadow-2xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl shadow-lg">
                        ✨
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-emerald-100 mb-3">
                          AI Feedback
                        </h3>
                        <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                          {feedback}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-12 shadow-2xl text-center"
          >
            <div className="text-6xl mb-4">😕</div>
            <p className="text-white/70 text-lg">No questions available. Please try again.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
