// src/pages/StackSelect.jsx  –  Layer 2: Stack / Specialization Selection
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Wrench,
  PlusCircle,
  X,
  CheckCircle2,
  Tag,
  Layers,
  Info,
} from "lucide-react";
import { STACKS as PREDEFINED_STACKS, getRoleById } from "../constants/rolesData.js";
import { saveUserSelection } from "../services/api.js";
import InfoModal from "../components/InfoModal.jsx";

// ── Stack colour palettes (cycling) ─────────────────────────────────────────
const STACK_COLORS = [
  { card: "from-blue-500/20 to-cyan-500/20",     tool: "bg-blue-500/15 text-blue-300 border-blue-500/25"     },
  { card: "from-emerald-500/20 to-teal-500/20",  tool: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  { card: "from-violet-500/20 to-purple-500/20", tool: "bg-violet-500/15 text-violet-300 border-violet-500/25" },
  { card: "from-pink-500/20 to-rose-500/20",     tool: "bg-pink-500/15 text-pink-300 border-pink-500/25"     },
  { card: "from-orange-500/20 to-amber-500/20",  tool: "bg-orange-500/15 text-orange-300 border-orange-500/25" },
  { card: "from-fuchsia-500/20 to-pink-500/20",  tool: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25" },
  { card: "from-indigo-500/20 to-sky-500/20",    tool: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25" },
  { card: "from-lime-500/20 to-green-500/20",    tool: "bg-lime-500/15 text-lime-300 border-lime-500/25"     },
];

const emptyStack = { name: "", description: "", keyTools: "", tags: "" };

export default function StackSelect() {
  const navigate   = useNavigate();
  const { roleId } = useParams();
  const location   = useLocation();

  // ── Role info ────────────────────────────────────────────────────────────────
  const roleFromState = location.state?.role || null;
  const role = roleFromState || getRoleById(roleId) || {
    id: roleId, title: roleId, shortDescription: "", category: "", color: "from-blue-500/25 to-cyan-500/25",
  };

  // ── Stacks: predefined + any custom stacks passed via navigate state ─────────
  const customStacksFromState = location.state?.customStacks || [];
  const predefined = PREDEFINED_STACKS.filter((s) => s.roleId === roleId.toUpperCase());
  const [stacks, setStacks] = useState([...predefined, ...customStacksFromState]);

  // ── Modal + toast state ─────────────────────────────────────────────────────
  const [showModal,  setShowModal]  = useState(false);
  const [showToast,  setShowToast]  = useState(false);
  const [toastMsg,   setToastMsg]   = useState("");
  const [newStack,   setNewStack]   = useState(emptyStack);
  const [selecting,  setSelecting]  = useState(null); // stackId being processed
  const [infoStack,  setInfoStack]  = useState(null); // stack whose detail modal is open

  // ── Add custom stack ─────────────────────────────────────────────────────────
  const handleAddStack = (e) => {
    e.preventDefault();
    if (!newStack.name.trim()) return;

    const stack = {
      id: `${roleId.toUpperCase()}-CUSTOM-${Date.now()}`,
      roleId: roleId.toUpperCase(),
      name: newStack.name.trim(),
      description: newStack.description.trim(),
      keyTools: newStack.keyTools.split(",").map((t) => t.trim()).filter(Boolean),
      tags: newStack.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    setStacks((prev) => [...prev, stack]);
    setShowModal(false);
    setNewStack(emptyStack);
    toast("Stack added!");
  };

  const toast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // ── Select a stack → save + go to resume upload ───────────────────────────
  const handleSelectStack = async (stack) => {
    setSelecting(stack.id);
    const userId = JSON.parse(sessionStorage.getItem("user") || "{}")._id;
    if (userId) {
      await saveUserSelection(userId, role.id, stack.id, role.title, stack.name).catch(
        (err) => console.warn("Selection save skipped:", err.message)
      );
    }
    setSelecting(null);
    navigate(`/uploadresume/${encodeURIComponent(role.title)}`, {
      state: { role, stack },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-14 px-4 sm:px-8">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl mb-10"
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Roles
        </button>

        {/* Role badge + title */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} border border-white/10 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0`}>
            {role.id}
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-0.5">
              {role.category} · Layer 2
            </p>
            <h1 className="text-3xl font-bold text-white">
              Pick your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                {role.title}
              </span>{" "}
              stack
            </h1>
            {role.shortDescription && (
              <p className="text-gray-400 text-sm mt-1">{role.shortDescription}</p>
            )}
          </div>
        </div>

        {/* Progress breadcrumb */}
        <div className="flex items-center gap-2 mt-6">
          {["Role", "Stack", "Resume"].map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all
                ${i === 1
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-md shadow-indigo-500/20"
                  : i === 0
                  ? "bg-blue-500/10 text-blue-400/60 border border-blue-500/20"
                  : "bg-white/5 text-gray-500 border border-white/5"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px]
                  ${i === 0 ? "bg-blue-500/60 text-white" : i === 1 ? "bg-indigo-500 text-white" : "bg-white/10 text-gray-400"}`}>
                  {i === 0 ? "✓" : i + 1}
                </span>
                {label}
              </div>
              {i < 2 && <ChevronRight size={12} className="text-gray-600" />}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* ── Stack count + instructions ── */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            <span className="font-semibold text-white">{stacks.length}</span> specialization{stacks.length !== 1 ? "s" : ""} available
          </p>
          <p className="text-gray-500 text-xs">Click a stack to continue →</p>
        </div>
      </div>

      {/* ── Stack grid ── */}
      {stacks.length === 0 ? (
        <div className="text-center py-20">
          <Layers size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No stacks yet — add one below.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl">
          {stacks.map((stack, index) => {
            const palette = STACK_COLORS[index % STACK_COLORS.length];
            const isBusy  = selecting === stack.id;
            return (
              <StackTile
                key={stack.id}
                stack={stack}
                index={index}
                palette={palette}
                isBusy={isBusy}
                onClick={() => !selecting && handleSelectStack(stack)}
                onInfo={() => setInfoStack(stack)}
              />
            );
          })}
        </div>
      )}

      {/* ── Add Stack Button ── */}
      <motion.button
        id="add-stack-btn"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setShowModal(true)}
        className="mt-10 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow border border-white/10 text-sm"
      >
        <PlusCircle size={18} />
        Add New Stack
      </motion.button>

      {/* ── Add Stack Modal ── */}
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
              className="bg-gray-950 border border-white/10 rounded-2xl p-7 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => { setShowModal(false); setNewStack(emptyStack); }}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold text-white mb-1">Add Stack</h3>
              <p className="text-gray-500 text-xs mb-6">
                Adding a specialization for <span className="text-indigo-300 font-semibold">{role.title}</span>
              </p>

              <form onSubmit={handleAddStack} className="space-y-3">
                <input
                  id="new-stack-name"
                  type="text"
                  placeholder="Stack name (e.g., Svelte)"
                  value={newStack.name}
                  onChange={(e) => setNewStack({ ...newStack, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500/60 outline-none text-white placeholder-gray-500 text-sm"
                />
                <input
                  id="new-stack-desc"
                  type="text"
                  placeholder="1-line description"
                  value={newStack.description}
                  onChange={(e) => setNewStack({ ...newStack, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500/60 outline-none text-white placeholder-gray-500 text-sm"
                />
                <input
                  id="new-stack-tools"
                  type="text"
                  placeholder="Key tools — comma separated (e.g., Svelte, Vite, SvelteKit)"
                  value={newStack.keyTools}
                  onChange={(e) => setNewStack({ ...newStack, keyTools: e.target.value })}
                  className="w-full px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500/60 outline-none text-white placeholder-gray-500 text-sm"
                />
                <input
                  id="new-stack-tags"
                  type="text"
                  placeholder="Tags — comma separated (e.g., SSR, JavaScript)"
                  value={newStack.tags}
                  onChange={(e) => setNewStack({ ...newStack, tags: e.target.value })}
                  className="w-full px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500/60 outline-none text-white placeholder-gray-500 text-sm"
                />

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm shadow-lg shadow-indigo-500/20 mt-1"
                >
                  Save Stack
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
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Info Detail Modal ── */}
      {infoStack && (
        <InfoModal
          item={infoStack}
          type="stack"
          onClose={() => setInfoStack(null)}
        />
      )}
    </div>
  );
}

// ── Sub-component: StackTile ─────────────────────────────────────────────────
function StackTile({ stack, index, palette, isBusy, onClick, onInfo }) {
  // Derive a simple accent color from the tool chip color class
  const accentClass = palette.tool.includes("blue")     ? "bg-blue-400"
                    : palette.tool.includes("violet")   ? "bg-violet-400"
                    : palette.tool.includes("emerald")  ? "bg-emerald-400"
                    : palette.tool.includes("rose")     ? "bg-rose-400"
                    : palette.tool.includes("amber")    ? "bg-amber-400"
                    : palette.tool.includes("fuchsia")  ? "bg-fuchsia-400"
                    : palette.tool.includes("indigo")   ? "bg-indigo-400"
                    : "bg-cyan-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.015 }}
      onClick={onClick}
      className={`
        group cursor-pointer relative overflow-hidden
        flex flex-col gap-3
        min-h-[200px] p-5 rounded-[18px]
        bg-gradient-to-br ${palette.card}
        border border-white/[0.08]
        shadow-[0_4px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]
        hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)]
        hover:border-white/[0.18]
        backdrop-blur-[11px]
        transition-all duration-[250ms] ease-out
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${accentClass} opacity-50 group-hover:opacity-90 transition-opacity`} />

      {/* Ambient glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-[0.14] bg-white group-hover:opacity-[0.24] transition-opacity pointer-events-none" />

      {/* ── TITLE ROW: name | (i)  → ── */}
      <div className="flex items-start justify-between gap-2 pl-3">

        {/* Left: name */}
        <h2 className="text-[15px] font-bold text-white leading-snug tracking-tight flex-1 min-w-0 truncate">
          {stack.name}
        </h2>

        {/* Right: icon group [(i)  →] */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Info icon — secondary action */}
          <button
            onClick={(e) => { e.stopPropagation(); onInfo(); }}
            className="flex items-center justify-center w-[26px] h-[26px] rounded-full
                       bg-white/[0.08] hover:bg-white/[0.18] text-white/35 hover:text-white/90
                       hover:scale-110 transition-all duration-150"
            aria-label={`Info about ${stack.name}`}
          >
            <Info size={12} />
          </button>
          {/* Arrow — primary navigation cue */}
          <div className={`flex items-center justify-center w-[26px] h-[26px] rounded-full
                           bg-white/[0.04] text-white/45
                           group-hover:text-white/90 group-hover:translate-x-0.5 transition-all duration-200
                           ${isBusy ? "animate-pulse text-white/70" : ""}`}>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* ── DESCRIPTION ── */}
      {stack.description && (
        <p className="text-gray-400/80 text-[11px] leading-relaxed pl-3 line-clamp-2">
          {stack.description}
        </p>
      )}

      {/* ── TOOLS (max 3 chips + overflow) ── */}
      {stack.keyTools?.length > 0 && (
        <div className="pl-3 mt-1">
          <div className="flex items-center gap-1 mb-2">
            <Wrench size={10} className="text-gray-500" />
            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.1em]">Tools</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stack.keyTools.slice(0, 3).map((tool, i) => (
              <span
                key={i}
                className={`px-2.5 py-[3px] rounded-full text-[10px] font-semibold border ${palette.tool}`}
              >
                {tool}
              </span>
            ))}
            {stack.keyTools.length > 3 && (
              <span className="px-2.5 py-[3px] rounded-full text-[10px] font-semibold border
                               bg-white/[0.05] text-gray-400 border-white/10">
                +{stack.keyTools.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── TAGS ── */}
      {stack.tags?.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-3 mt-auto">
          <Tag size={10} className="text-gray-600 shrink-0" />
          {stack.tags.map((tag, i) => (
            <span key={i} className="text-[10px] text-gray-500 font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}


      {isBusy && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}


