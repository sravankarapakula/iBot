// src/pages/ResumeAnalysis.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowLeft,
  Loader2,
  Download,
  Brain,
  Briefcase,
  Heart,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";
import { jsPDF } from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function ResumeAnalysis() {
  const navigate = useNavigate();
  const { roleTitle } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    const storedResume = localStorage.getItem("uploadedResumeText");
    if (storedResume) {
      setResumeText(storedResume);
      analyzeResume(storedResume);
    }
  }, []);

  const startInterview = (roundType) => {
    navigate(`/interview-session/${roundType}`, {
      state: {
        role: roleTitle,
        resumeText: resumeText,
        round: roundType
      }
    });
  };

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

  const extractTextFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(arrayBuffer);
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    try {
      let text = "";
      if (file.name.endsWith(".pdf")) {
        text = await extractTextFromPDF(file);
      } else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
        text = await extractTextFromDocx(file);
      } else {
        throw new Error("Unsupported file format");
      }

      localStorage.setItem("uploadedResumeText", text);
      setResumeText(text);
      analyzeResume(text);
    } catch (err) {
      console.error(err);
      setAnalysis({
        suggestions: ["⚠️ Failed to analyze resume."],
        matchScore: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeResume = (text) => {
    const result = generatePersonalizedSuggestions(roleTitle, text);
    setAnalysis(result);
  };

  const generatePersonalizedSuggestions = (role, resumeText) => {
    const lower = resumeText.toLowerCase();
    const suggestions = [];
    let matchScore = 85;

    if (role.toLowerCase().includes("developer")) {
      if (!lower.includes("react")) matchScore -= 8, suggestions.push("Add React.js experience.");
      if (!lower.includes("javascript")) matchScore -= 8, suggestions.push("Include JavaScript.");
    }

    if (role.toLowerCase().includes("manager")) {
      if (!lower.includes("lead")) matchScore -= 8, suggestions.push("Highlight leadership skills.");
    }

    if (suggestions.length === 0)
      suggestions.push("✅ Resume aligns well with the role.");

    return { suggestions, matchScore: Math.max(matchScore, 40) };
  };

  const handleDownloadReport = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    doc.text(`Resume Analysis - ${roleTitle}`, 10, 10);
    doc.text(`Match Score: ${analysis.matchScore}%`, 10, 20);
    analysis.suggestions.forEach((s, i) => {
      doc.text(`${i + 1}. ${s}`, 10, 30 + i * 10);
    });

    doc.save(`Resume_Analysis_${roleTitle}.pdf`);
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8 relative">

        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-gray-400 hover:text-white transition">
          <ArrowLeft size={22} />
        </button>

        <h1 className="text-xl font-bold text-center mb-4 text-white">Resume Analysis</h1>
        <p className="text-center mb-6 text-gray-300">
          Role: <span className="text-blue-400 font-semibold">{roleTitle}</span>
        </p>

        {!resumeText && (
          <form onSubmit={handleAnalyze} className="text-center">
            <input type="file" onChange={handleFileChange} className="text-gray-300 mb-4" />
            <motion.button type="submit" className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
              {loading ? "Analyzing..." : "Analyze Resume"}
            </motion.button>
          </form>
        )}

        {analysis && (
          <>
            <h2 className="mt-4 text-white font-semibold">Match: <span className="text-blue-300">{analysis.matchScore}%</span></h2>
            <ul className="list-disc pl-6 text-gray-300 mt-2 space-y-1">
              {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>

            <div className="flex gap-3 mt-6 flex-wrap justify-center">
              <button onClick={() => startInterview("technical")} className="bg-blue-600/80 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition flex items-center gap-2">
                <Brain size={18} /> Technical
              </button>

              <button onClick={() => startInterview("managerial")} className="bg-indigo-600/80 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition flex items-center gap-2">
                <Briefcase size={18} /> Managerial
              </button>

              <button onClick={() => startInterview("hr")} className="bg-pink-600/80 text-white px-4 py-2 rounded-xl hover:bg-pink-600 transition flex items-center gap-2">
                <Heart size={18} /> HR
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
