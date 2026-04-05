// src/pages/Dashboard.jsx  –  Layer 1: Role Selection
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Search,
  X,
  CheckCircle2,
  ChevronRight,
  Layers,
  Info,
} from "lucide-react";
import { ROLES as PREDEFINED_ROLES } from "../constants/rolesData.js";
import InfoModal from "../components/InfoModal.jsx";
import { DottedSurface } from "@/components/ui/dotted-surface";

// ── Category colour map ──────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Engineering:    { bg: "bg-blue-500/15",    text: "text-blue-300",    border: "border-blue-500/30",    accent: "bg-blue-400"    },
  "Data & AI":    { bg: "bg-pink-500/15",    text: "text-pink-300",    border: "border-pink-500/30",    accent: "bg-pink-400"    },
  Infrastructure: { bg: "bg-orange-500/15",  text: "text-orange-300",  border: "border-orange-500/30",  accent: "bg-orange-400"  },
  Design:         { bg: "bg-fuchsia-500/15", text: "text-fuchsia-300", border: "border-fuchsia-500/30", accent: "bg-fuchsia-400" },
};

const defaultCategory = {
  bg: "bg-gray-500/15", text: "text-gray-300", border: "border-gray-500/30", accent: "bg-gray-400",
};

const GRADIENT_PRESETS = [
  "from-blue-500/25 to-cyan-500/25",
  "from-emerald-500/25 to-teal-500/25",
  "from-violet-500/25 to-purple-500/25",
  "from-pink-500/25 to-rose-500/25",
  "from-orange-500/25 to-amber-500/25",
  "from-fuchsia-500/25 to-pink-500/25",
  "from-indigo-500/25 to-sky-500/25",
  "from-lime-500/25 to-green-500/25",
];

const emptyRole = {
  id: "", title: "", shortDescription: "", category: "Engineering",
  color: GRADIENT_PRESETS[0],
  initialStacks: [{ name: "", description: "", keyTools: "", tags: "" }],
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roles, setRoles]   = useState(PREDEFINED_ROLES);
  const [showModal, setShowModal]   = useState(false);
  const [showToast, setShowToast]   = useState(false);
  const [newRole, setNewRole]       = useState(emptyRole);
  const [presetIdx, setPresetIdx]   = useState(0);
  const [infoRole, setInfoRole]     = useState(null); // role whose detail modal is open

  // ── extra stacks inside add-role modal ──────────────────────────────────────
  const addStackRow = () =>
    setNewRole((r) => ({
      ...r,
      initialStacks: [
        ...r.initialStacks,
        { name: "", description: "", keyTools: "", tags: "" },
      ],
    }));

  const removeStackRow = (i) =>
    setNewRole((r) => ({
      ...r,
      initialStacks: r.initialStacks.filter((_, idx) => idx !== i),
    }));

  const updateStackRow = (i, field, value) =>
    setNewRole((r) => {
      const s = [...r.initialStacks];
      s[i] = { ...s[i], [field]: value };
      return { ...r, initialStacks: s };
    });

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRole.id.trim() || !newRole.title.trim()) return;

    const role = {
      id: newRole.id.trim().toUpperCase(),
      title: newRole.title.trim(),
      shortDescription: newRole.shortDescription.trim(),
      category: newRole.category,
      color: newRole.color,
      accent: "#94a3b8",
      _customStacks: newRole.initialStacks
        .filter((s) => s.name.trim())
        .map((s, i) => ({
          id: `${newRole.id.toUpperCase()}-CUSTOM-${i}`,
          roleId: newRole.id.toUpperCase(),
          name: s.name.trim(),
          description: s.description.trim(),
          keyTools: s.keyTools.split(",").map((t) => t.trim()).filter(Boolean),
          tags: s.tags.split(",").map((t) => t.trim()).filter(Boolean),
        })),
    };

    setRoles((prev) => [...prev, role]);
    setShowModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
    setNewRole(emptyRole);
    setPresetIdx(0);
  };

  const filtered = roles.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── group by category ────────────────────────────────────────────────────────
  const grouped = filtered.reduce((acc, role) => {
    const cat = role.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(role);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col items-center py-14 px-4 sm:px-8 relative bg-transparent z-0">
      <DottedSurface />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Layers size={20} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 drop-shadow-lg">
            Choose Your Role
          </h1>
        </div>
        <p className="text-gray-200 text-sm max-w-md mx-auto">
          Select the role you're targeting. We'll tailor your interview prep, resume analysis and recommendations around it.
        </p>

        {/* Progress: step 1 of 3 */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {["Role", "Stack", "Resume"].map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all
                ${i === 0
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-md shadow-blue-500/20"
                  : "bg-white/5 text-gray-500 border border-white/5"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px]
                  ${i === 0 ? "bg-blue-500 text-white" : "bg-white/10 text-gray-400"}`}>
                  {i + 1}
                </span>
                {label}
              </div>
              {i < 2 && <ChevronRight size={12} className="text-gray-600" />}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* ── Search ── */}
      <div className="relative w-full max-w-2xl mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          id="role-search"
          type="text"
          placeholder="Search roles or categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 focus:ring-2 focus:ring-blue-500/60 outline-none text-white shadow-lg bg-white/5 backdrop-blur-md placeholder-gray-300 transition-all text-sm"
        />
      </div>

      {/* ── Role Grid (grouped by category) ── */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-500 mt-10">No roles match your search.</p>
      ) : (
        Object.entries(grouped).map(([category, catRoles]) => {
          const catStyle = CATEGORY_COLORS[category] || defaultCategory;
          return (
            <div key={category} className="w-full max-w-5xl mb-10">
              {/* Category heading */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                  {category}
                </span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {catRoles.map((role, index) => (
                  <RoleTile
                    key={role.id + index}
                    role={role}
                    index={index}
                    catStyle={catStyle}
                    onClick={() =>
                      navigate(`/stacks/${role.id}`, {
                        state: { role, customStacks: role._customStacks || [] },
                      })
                    }
                    onInfo={() => setInfoRole(role)}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* ── Add Role Button ── */}
      <motion.button
        id="add-role-btn"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setShowModal(true)}
        className="mt-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow border border-white/10 text-sm"
      >
        <PlusCircle size={18} />
        Add New Role
      </motion.button>

      {/* ── Add Role Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gray-950 border border-white/10 rounded-2xl p-7 w-full max-w-lg shadow-2xl relative overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => { setShowModal(false); setNewRole(emptyRole); }}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold text-white mb-1">Add New Role</h3>
              <p className="text-gray-500 text-xs mb-6">
                Fill in the role details and optionally pre-add stacks for it.
              </p>

              <form onSubmit={handleAddRole} className="space-y-4">
                {/* Role fields */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    id="new-role-id"
                    type="text"
                    placeholder="ID (e.g., UX, ML)"
                    value={newRole.id}
                    onChange={(e) => setNewRole({ ...newRole, id: e.target.value })}
                    required
                    className="px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-blue-500/60 outline-none text-white placeholder-gray-500 text-sm"
                  />
                  <select
                    id="new-role-category"
                    value={newRole.category}
                    onChange={(e) => setNewRole({ ...newRole, category: e.target.value })}
                    className="px-4 py-2.5 border border-white/10 bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/60 outline-none text-white text-sm"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Data & AI">Data & AI</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Design">Design</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <input
                  id="new-role-title"
                  type="text"
                  placeholder="Role Title (e.g., Security Engineer)"
                  value={newRole.title}
                  onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-blue-500/60 outline-none text-white placeholder-gray-500 text-sm"
                />

                <input
                  id="new-role-desc"
                  type="text"
                  placeholder="One-line differentiator (e.g., Secure systems at scale)"
                  value={newRole.shortDescription}
                  onChange={(e) => setNewRole({ ...newRole, shortDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-blue-500/60 outline-none text-white placeholder-gray-500 text-sm"
                />

                {/* Colour picker */}
                <div>
                  <p className="text-gray-400 text-xs mb-2 font-medium">Card colour</p>
                  <div className="flex gap-2 flex-wrap">
                    {GRADIENT_PRESETS.map((g, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => { setNewRole({ ...newRole, color: g }); setPresetIdx(i); }}
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} border-2 transition-transform ${presetIdx === i ? "border-white scale-110" : "border-transparent"}`}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Stacks section ── */}
                <div className="border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-300 text-sm font-semibold">Initial Stacks (optional)</p>
                    <button
                      type="button"
                      onClick={addStackRow}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <PlusCircle size={13} /> Add Stack
                    </button>
                  </div>

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {newRole.initialStacks.map((stack, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 relative">
                        {newRole.initialStacks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStackRow(i)}
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-400 transition"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <input
                          type="text"
                          placeholder="Stack name (e.g., React)"
                          value={stack.name}
                          onChange={(e) => updateStackRow(i, "name", e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-xs outline-none focus:ring-1 focus:ring-blue-500/50 mb-2"
                        />
                        <input
                          type="text"
                          placeholder="1-line description"
                          value={stack.description}
                          onChange={(e) => updateStackRow(i, "description", e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-xs outline-none focus:ring-1 focus:ring-blue-500/50 mb-2"
                        />
                        <input
                          type="text"
                          placeholder="Key tools (comma separated)"
                          value={stack.keyTools}
                          onChange={(e) => updateStackRow(i, "keyTools", e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-xs outline-none focus:ring-1 focus:ring-blue-500/50 mb-2"
                        />
                        <input
                          type="text"
                          placeholder="Tags (comma separated)"
                          value={stack.tags}
                          onChange={(e) => updateStackRow(i, "tags", e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-xs outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm shadow-lg shadow-blue-500/20"
                >
                  Save Role
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 right-8 bg-emerald-500/90 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md text-sm font-medium"
          >
            <CheckCircle2 size={20} />
            Role added successfully!
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Info Detail Modal ── */}
      {infoRole && (
        <InfoModal
          item={infoRole}
          type="role"
          onClose={() => setInfoRole(null)}
        />
      )}
    </div>
  );
}

// ── Sub-component: RoleTile ──────────────────────────────────────────────────
function RoleTile({ role, index, catStyle, onClick, onInfo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.015 }}
      onClick={onClick}
      className={`
        group cursor-pointer relative overflow-hidden
        flex flex-col gap-2
        min-h-[168px] p-5 rounded-[18px]
        bg-slate-800/40
        border border-white/20
        shadow-[0_10px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
        hover:shadow-[0_10px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]
        hover:border-white/40
        backdrop-blur-xl
        transition-all duration-[250ms] ease-out
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${catStyle.accent ?? "bg-white/20"} opacity-60 group-hover:opacity-100 transition-opacity`} />

      {/* Ambient glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-[0.18] bg-white group-hover:opacity-[0.28] transition-opacity pointer-events-none" />

      {/* ── TITLE ROW: category badge | title | (i) → ── */}
      <div className="flex items-start justify-between gap-2 pl-3">

        {/* Left: category + title */}
        <div className="flex-1 min-w-0">
          <span className={`inline-flex items-center text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-[3px] rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border} mb-1.5`}>
            {role.category}
          </span>
          <h2 className="text-[15px] font-bold text-white leading-snug tracking-tight truncate">
            {role.title}
          </h2>
        </div>

        {/* Right: icon group [(i)  →] */}
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {/* Info icon — secondary action */}
          <button
            onClick={(e) => { e.stopPropagation(); onInfo(); }}
            className="flex items-center justify-center w-[26px] h-[26px] rounded-full
                       bg-white/[0.08] hover:bg-white/[0.18] text-white/35 hover:text-white/90
                       hover:scale-110 transition-all duration-150"
            aria-label={`Info about ${role.title}`}
          >
            <Info size={12} />
          </button>
          {/* Arrow — primary direction cue */}
          <div className="flex items-center justify-center w-[26px] h-[26px] rounded-full
                          bg-white/[0.04] text-white/45
                          group-hover:text-white/90 group-hover:translate-x-0.5 transition-all duration-200">
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* ── DESCRIPTION ── */}
      <p className="text-gray-200 text-[12px] leading-relaxed pl-3 line-clamp-2">
        {role.shortDescription}
      </p>

      {/* ── FOOTER: role ID badge ── */}
      <div className="mt-auto pl-3">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/50 uppercase tracking-widest">
          {role.id}
        </span>
      </div>
    </motion.div>
  );
}
