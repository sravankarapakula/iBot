import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadResume, generateInterviewQuestions } from "../api/api";
import { ArrowLeft, ArrowRightCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import roleInfo from "../data/roleInfo";

export default function Interview() {
  const navigate = useNavigate();
  const { roleTitle } = useParams();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [round, setRound] = useState(1);
  const [roleData, setRoleData] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  const totalRounds = 3;
  const roundNames = [
    "Technical Round 1",
    "Technical / Managerial Round",
    "HR Round",
  ];

  useEffect(() => {
    const formattedRole = roleTitle.toLowerCase().replace(/ /g, "-");
    setRoleData(roleInfo[formattedRole]);
    setJobDescription(`We are hiring a skilled ${roleTitle.replace(/-/g, " ")}...`);
  }, [roleTitle]);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file first!");
    setUploading(true);
    try {
      const data = await uploadResume(selectedFile);
      setResumeText(data.resumeText);
      setExtractedData({
        skills: data.skills,
        experience: data.experience,
        education: data.education,
        certifications: data.certifications,
      });
      alert("Resume uploaded and analyzed successfully!");
    } catch (error) {
      alert("Error uploading resume");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!resumeText) return alert("Upload resume first!");

    try {
      const difficulty =
        roleData?.difficulty ||
        (round === 1 ? "medium" : round === 2 ? "hard" : "easy");
      const companyType = roleData?.category || "development";

      const result = await generateInterviewQuestions({
        jobDescription,
        resumeText,
        round,
        difficulty,
        companyType,
      });

      setQuestions(result.questions.split("\n").filter((q) => q.trim() !== ""));
    } catch (err) {
      alert("Error generating questions");
      console.error(err);
    }
  };

  const nextRound = () => {
    if (round < totalRounds) {
      setRound(round + 1);
      setQuestions([]);
    } else {
      alert("🎉 All interview rounds completed!");
      navigate("/dashboard");
    }
  };

  const roundColors = ["from-blue-100", "from-orange-100", "from-green-100"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl relative"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-5 left-5 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* Header */}
        <div className="mt-10 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {roleTitle.replace(/-/g, " ")} — {roundNames[round - 1]}
          </h1>
          <p className="text-gray-600">{jobDescription}</p>
        </div>

        {/* Role Info */}
        {roleData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mt-6 p-5 rounded-xl bg-gradient-to-r ${roundColors[round - 1]} via-white`}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {roleData.title} — Key Insights
            </h2>
            <p className="text-gray-700 mb-3">{roleData.overview}</p>
          </motion.div>
        )}

        {/* Upload + Questions Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={round}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            {/* Upload Resume */}
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">
                Upload Resume (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`mt-3 px-4 py-2 rounded-lg text-white font-semibold ${
                  uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {uploading ? "Analyzing..." : "Upload & Analyze Resume"}
              </button>
            </div>

            {/* Resume Insights */}
            {extractedData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 shadow-inner"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  🧠 Resume Insights
                </h3>
                <ul className="space-y-1 text-gray-700">
                  <li><strong>Skills:</strong> {extractedData.skills}</li>
                  <li><strong>Experience:</strong> {extractedData.experience}</li>
                  <li><strong>Education:</strong> {extractedData.education}</li>
                  <li><strong>Certifications:</strong> {extractedData.certifications}</li>
                </ul>
              </motion.div>
            )}

            {/* Generate Questions */}
            <button
              onClick={handleGenerateQuestions}
              disabled={!resumeText}
              className={`w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold ${
                !resumeText && "opacity-50 cursor-not-allowed"
              }`}
            >
              Generate {roundNames[round - 1]} Questions
            </button>

            {/* Display Questions */}
            {questions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Round {round}: AI-Generated Questions
                </h3>
                <ul className="list-decimal pl-6 space-y-2 text-gray-700">
                  {questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextRound}
                  className="mt-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold mx-auto"
                >
                  {round < totalRounds ? (
                    <>
                      Next Round <ArrowRightCircle size={20} />
                    </>
                  ) : (
                    "Finish Interview"
                  )}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
