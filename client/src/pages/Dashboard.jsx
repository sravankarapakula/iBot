import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Search, X, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [roles, setRoles] = useState([
    {
      id: "FE",
      title: "Frontend Engineer",
      desc: "Preparing for UI-rich app interviews",
      exp: "2 Years",
      qna: "12 Q&A",
      date: "1st Oct 2025",
      skills: "React, CSS, HTML, JavaScript",
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      id: "BE",
      title: "Backend Engineer",
      desc: "Focused on scalable service backends",
      exp: "3 Years",
      qna: "14 Q&A",
      date: "1st Oct 2025",
      skills: "Node.js, Express, MongoDB, REST APIs",
      color: "from-emerald-500/20 to-teal-500/20",
    },
    {
      id: "FS",
      title: "Full Stack Dev",
      desc: "Handling both client & server sides",
      exp: "4 Years",
      qna: "10 Q&A",
      date: "1st Oct 2025",
      skills: "MERN stack, deployment, auth",
      color: "from-violet-500/20 to-purple-500/20",
    },
    {
      id: "DS",
      title: "Data Scientist",
      desc: "Analyzing finance and product datasets",
      exp: "2 Years",
      qna: "10 Q&A",
      date: "1st Oct 2025",
      skills: "Python, Pandas, ML, SQL",
      color: "from-pink-500/20 to-rose-500/20",
    },
    {
      id: "DEV",
      title: "DevOps",
      desc: "Switching to automation-heavy workflows",
      exp: "5 Years",
      qna: "12 Q&A",
      date: "1st Oct 2025",
      skills: "CI/CD, Docker, AWS, Kubernetes",
      color: "from-orange-500/20 to-amber-500/20",
    },
    {
      id: "UX",
      title: "UI/UX Designer",
      desc: "Mastering product design strategies",
      exp: "3 Years",
      qna: "10 Q&A",
      date: "1st Oct 2025",
      skills: "Figma, wireframing, accessibility",
      color: "from-fuchsia-500/20 to-pink-500/20",
    },
  ]);

  const [newRole, setNewRole] = useState({
    id: "",
    title: "",
    desc: "",
    exp: "",
    qna: "",
    date: "",
    skills: "",
    color: "from-teal-500/20 to-cyan-500/20",
  });

  const filteredRoles = roles.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddRole = (e) => {
    e.preventDefault();
    if (newRole.id && newRole.title) {
      setRoles([...roles, newRole]);
      setShowModal(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      setNewRole({
        id: "",
        title: "",
        desc: "",
        exp: "",
        qna: "",
        date: "",
        skills: "",
        color: "from-teal-500/20 to-cyan-500/20",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-16 px-6">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 mb-10 text-center drop-shadow-lg">
        Interview Prep Dashboard
      </h1>

      {/* Search Bar */}
      <div className="relative w-full max-w-2xl mb-10">
        <input
          type="text"
          placeholder="Search roles (e.g. Frontend, DevOps)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-blue-400 outline-none text-white shadow-lg bg-white/10 backdrop-blur-md placeholder-gray-400/80 transition-all"
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
          size={20}
        />
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {filteredRoles.map((role, index) => (
          <motion.div
            key={role.id + index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.45 }}
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer bg-gradient-to-br ${role.color} border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md hover:shadow-2xl hover:border-white/30 transition-all flex flex-col justify-between min-h-[220px]`}
            // ✅ Navigate to UploadResume
            onClick={() =>
              navigate(`/uploadresume/${encodeURIComponent(role.title)}`, {
                state: { role },
              })
            }
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 shrink-0 aspect-square rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-inner text-lg">
                  {role.id}
                </div>
                <h2 className="text-xl font-bold text-white tracking-wide leading-tight">{role.title}</h2>
              </div>
              <p className="text-gray-200 mb-6 text-sm font-medium">{role.skills}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-gray-300/90 text-xs font-semibold border-t border-white/10 pt-4 mt-auto">
              <span className="text-left">{role.exp}</span>
              <span className="text-center">{role.qna}</span>
              <span className="text-right whitespace-nowrap">{role.date}</span>
            </div>
            <p className="text-gray-300/90 text-sm leading-relaxed">{role.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Add Role Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="mt-12 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-2xl hover:shadow-blue-500/40 transition-shadow border border-white/10"
      >
        <PlusCircle size={20} />
        Add New Role
      </motion.button>

      {/* Add Role Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition"
              >
                <X size={22} />
              </button>
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Add New Role
              </h3>
              <form onSubmit={handleAddRole} className="space-y-4">
                <input
                  type="text"
                  placeholder="Role ID (e.g., UX, BE)"
                  value={newRole.id}
                  onChange={(e) =>
                    setNewRole({ ...newRole, id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Role Title"
                  value={newRole.title}
                  onChange={(e) =>
                    setNewRole({ ...newRole, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Skills"
                  value={newRole.skills}
                  onChange={(e) =>
                    setNewRole({ ...newRole, skills: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Experience"
                  value={newRole.exp}
                  onChange={(e) =>
                    setNewRole({ ...newRole, exp: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Questions"
                  value={newRole.qna}
                  onChange={(e) =>
                    setNewRole({ ...newRole, qna: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Last Updated"
                  value={newRole.date}
                  onChange={(e) =>
                    setNewRole({ ...newRole, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white placeholder-gray-500"
                />
                <textarea
                  placeholder="Description"
                  value={newRole.desc}
                  onChange={(e) =>
                    setNewRole({ ...newRole, desc: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none text-white placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Save Role
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-10 right-10 bg-green-500/90 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 backdrop-blur-md"
          >
            <CheckCircle2 size={22} />
            <span className="font-medium">Role added successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
