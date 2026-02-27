import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Edit3, Loader2, FileText, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [about, setAbout] = useState("");
  const [avatar, setAvatar] = useState("");
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const email = storedUser?.email;
  const name = storedUser?.name;
  const photo = storedUser?.photo;


  // ✅ Fetch profile + history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await axios.get(
          `http://localhost:5000/api/user/profile/${email}`
        );

        const historyRes = await axios.get(
          `http://localhost:5000/api/user/history/${email}`
        );

        setProfile(profileRes.data || {});
        setAbout(profileRes.data?.about || "");
        setAvatar(profileRes.data?.avatar || "");
        setAnalysisHistory(historyRes.data || []);
      } catch (error) {
        console.error("API ERROR:", error);
        setProfile({
          name: "Guest User",
          email: email
        });
      } finally {
        setLoading(false); // ✅ ALWAYS stops loader now
      }
    };

    fetchData();
  }, [email]);


  // ✅ Save profile updates
  const handleSave = async () => {
    try {
      await axios.post("http://localhost:5000/api/user/profile", {
        email,
        name: profile.name,
        avatar,
        about,
      });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }


  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8"
      >
        <div className="flex items-center gap-6 mb-6">
          <img
            src={
              avatar ||
              "https://api.dicebear.com/7.x/initials/svg?seed=" +
              (profile.name || "User")
            }
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-blue-500/50 shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <User className="text-blue-400" /> {name || "User"}
            </h1>
            <p className="text-gray-300 flex items-center gap-1 mt-1">
              <Mail className="text-blue-300" size={16} /> {email}
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-100 mb-3 flex items-center gap-2">
            <Edit3 className="text-blue-400" /> About Me
          </h2>
          {editing ? (
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-white placeholder-gray-500"
              rows={4}
            />
          ) : (
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">
              {about || "No information provided yet."}
            </p>
          )}
          <div className="mt-4">
            {editing ? (
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-lg"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-white/10 text-blue-300 border border-white/10 rounded-lg hover:bg-white/20 transition"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Analysis History */}
        <div>
          <h2 className="text-xl font-semibold text-blue-100 mb-4 flex items-center gap-2">
            <FileText className="text-blue-400" /> Resume Analysis History
          </h2>
          {analysisHistory.length === 0 ? (
            <p className="text-gray-500 italic">No analyses yet.</p>
          ) : (
            <div className="space-y-4">
              {analysisHistory.map((a, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center hover:bg-white/10 transition"
                >
                  <div>
                    <p className="font-semibold text-white">
                      Role: {a.role}
                    </p>
                    <p className="text-sm text-gray-400">
                      Match Score: <span className="text-blue-300">{a.matchScore}%</span> | {new Date(a.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-sm hover:bg-blue-500/30 transition">
                    Download Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Resume Button */}
        <div className="mt-10 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/uploadresume")}
            className="flex items-center justify-center gap-2 mx-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-blue-500/40 transition border border-white/10"
          >
            <Upload size={18} /> Change Resume
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
