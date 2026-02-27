// src/pages/UploadResume.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Loader2,
  Upload,
  Download,
  ArrowLeft,
  Brain,
  Briefcase,
  Heart,
  RotateCcw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";
import { jsPDF } from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function UploadResume() {
  const navigate = useNavigate();
  const { title: roleTitle } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // 📄 Extract text from PDF
  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((s) => s.str).join(" ");
      text += pageText + "\n";
    }
    return text;
  };

  // 📄 Extract text from DOCX (simple fallback)
  const extractTextFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder("utf-8");
    return textDecoder.decode(arrayBuffer);
  };

  // 📤 When file selected
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 🧠 Personalized Analysis
  const generatePersonalizedSuggestions = (role, resumeText) => {
    const lower = resumeText.toLowerCase();
    const suggestions = [];
    let matchScore = 90;

    if (role.toLowerCase().includes("developer")) {
      if (!lower.includes("react")) {
        suggestions.push("Add React.js experience to strengthen your frontend profile.");
        matchScore -= 10;
      }
      if (!lower.includes("javascript")) {
        suggestions.push("Include JavaScript or TypeScript in your skill set.");
        matchScore -= 10;
      }
      if (!lower.includes("project")) {
        suggestions.push("Showcase key projects demonstrating your coding expertise.");
        matchScore -= 5;
      }
    }

    if (role.toLowerCase().includes("designer")) {
      if (!lower.includes("figma")) {
        suggestions.push("Mention design tools such as Figma or Adobe XD.");
        matchScore -= 10;
      }
      if (!lower.includes("portfolio")) {
        suggestions.push("Add a link to your design portfolio for credibility.");
        matchScore -= 10;
      }
    }

    if (role.toLowerCase().includes("manager")) {
      if (!lower.includes("lead")) {
        suggestions.push("Highlight leadership or project management experience.");
        matchScore -= 10;
      }
      if (!lower.includes("communication")) {
        suggestions.push("Include communication and coordination skills.");
        matchScore -= 5;
      }
    }

    if (suggestions.length === 0)
      suggestions.push("✅ Excellent! Your resume aligns well with this role.");

    return { suggestions, matchScore: Math.max(matchScore, 40) };
  };

  // ⚙️ Handle Resume Upload + Analysis
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("role", roleTitle);

      // Call backend API
      const response = await fetch("http://localhost:5000/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setAnalysis({
        matchScore: data.insights.matchScore,
        suggestions: data.insights.suggestions,
        opinion: data.insights.opinion,
        missingKeywords: data.insights.missingKeywords,
        resumeText: data.insights.resumeText // Backend might not return text back, but we can if needed or just ignore
      });

    } catch (err) {
      console.error("Error analyzing resume:", err);
      alert("⚠️ Failed to process resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 💾 Download PDF Report (fixed encoding issue)
  const handleDownloadReport = () => {
    if (!analysis || !analysis.suggestions) return;

    const doc = new jsPDF();
    const marginLeft = 20;
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text("Interview Companion", marginLeft, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Resume Analysis Report - Role: ${roleTitle}`, marginLeft, y);
    y += 10;

    doc.setDrawColor(33, 150, 243);
    doc.line(marginLeft, y, 190, y);
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94);
    doc.text(`Match Score: ${analysis.matchScore}%`, marginLeft, y);
    y += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Suggestions:", marginLeft, y);
    y += 8;

    const suggestionsText = analysis.suggestions
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n\n");

    const lines = doc.splitTextToSize(suggestionsText, 170);
    doc.text(lines, marginLeft, y);
    y += lines.length * 7;

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text("Generated by Interview Companion © 2025", marginLeft, 280);

    doc.save(`Resume_Analysis_${roleTitle}.pdf`);
  };

  // 🔁 Reset to upload another resume
  const handleChangeResume = () => {
    setFile(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 relative"
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={22} />
        </button>

        <h1 className="text-3xl font-bold text-white text-center mb-4">
          Upload Your Resume
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Role Selected:{" "}
          <span className="font-semibold text-blue-400">{roleTitle}</span>
        </p>

        {!analysis ? (
          <form onSubmit={handleUpload}>
            <label
              htmlFor="resume"
              className="border-2 border-dashed border-blue-500/30 rounded-xl py-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition bg-white/5"
            >
              <FileText size={40} className="text-blue-400 mb-3" />
              <p className="text-gray-300 mb-2">
                {file ? file.name : "Click or drag file to upload"}
              </p>
              <p className="text-sm text-gray-500">(PDF or DOCX format)</p>
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!file || loading}
              className={`mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md transition ${file && !loading
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/40"
                : "bg-gray-700 cursor-not-allowed"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Upload size={18} /> Upload & Analyze
                </>
              )}
            </motion.button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-blue-300 mb-3">
              Resume Match: {analysis.matchScore}%
            </h2>

            {analysis.opinion && (
              <div className="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="font-semibold text-blue-200 mb-1">AI Opinion:</h3>
                <p className="text-gray-300 italic">"{analysis.opinion}"</p>
              </div>
            )}

            {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-300 mb-2">Missing Keywords:</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/10 text-red-200 rounded-full text-sm border border-red-500/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <h3 className="font-semibold text-gray-200 mb-2">Suggestions for Improvement:</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              {analysis.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 mt-6 justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-green-600/80 text-white hover:bg-green-600 border border-green-500/30"
              >
                <Download size={18} /> Download Report
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleChangeResume}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-yellow-600/80 text-white hover:bg-yellow-600 border border-yellow-500/30"
              >
                <RotateCcw size={18} /> Change Resume
              </motion.button>
            </div>

            <div className="flex justify-center mt-6 gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/technical")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/80 text-white hover:bg-blue-600"
              >
                <Brain size={18} /> Technical
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/managerial")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/80 text-white hover:bg-indigo-600"
              >
                <Briefcase size={18} /> Managerial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/hr")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600/80 text-white hover:bg-pink-600"
              >
                <Heart size={18} /> HR
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() =>
                navigate("/interview-session/technical", {
                  state: {
                    role: roleTitle,
                    resumeText: analysis.resumeText,
                  },
                })
              }
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition"
            >
              🚀 Start AI Interview
            </motion.button>
          </motion.div>

        )}
      </motion.div>
    </div >
  );
}
