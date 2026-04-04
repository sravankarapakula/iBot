// src/components/InfoModal.jsx
// Shared modal used by RoleTile and StackTile for full detail view.
// Click (i) → open. Close: X button, overlay click, ESC key.
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, Tag, Info } from "lucide-react";

export default function InfoModal({ item, type, onClose }) {
  // ── ESC key closes modal ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;

  const isRole  = type === "role";
  const isStack = type === "stack";

  return (
    <AnimatePresence>
      {/* ── Overlay — click outside → close ── */}
      <motion.div
        key="info-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* ── Modal panel — click inside does NOT close ── */}
        <motion.div
          key="info-panel"
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-gray-950 border border-white/10 rounded-2xl shadow-2xl
                     w-full max-w-[600px] max-h-[85vh] overflow-y-auto"
        >
          {/* ── Close button ── */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center
                       rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white
                       transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* ── Content ── */}
          <div className="p-7 pt-6">

            {/* Header */}
            <div className="flex items-start gap-3 mb-5 pr-8">
              {isRole && (
                <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${item.color}
                                border border-white/10 flex items-center justify-center
                                font-bold text-white text-sm`}>
                  {item.id}
                </div>
              )}
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                  {isRole  ? item.category : "Stack / Specialization"}
                </p>
                <h2 className="text-xl font-bold text-white leading-snug">{item.title ?? item.name}</h2>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/8 mb-5" />

            {/* Description */}
            {(item.shortDescription || item.description) && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {item.shortDescription ?? item.description}
                </p>
              </div>
            )}

            {/* Key Tools (stack only) */}
            {isStack && item.keyTools?.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Wrench size={12} className="text-gray-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Key Tools ({item.keyTools.length})
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.keyTools.map((tool, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-semibold
                                 bg-blue-500/15 text-blue-300 border border-blue-500/25"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {item.tags?.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag size={12} className="text-gray-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tags
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs text-gray-400 font-medium bg-white/5
                                 border border-white/10 rounded-full px-2.5 py-0.5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Role ID badge (role only) */}
            {isRole && (
              <div className="mt-5 flex items-center gap-2">
                <Info size={13} className="text-gray-600" />
                <p className="text-[11px] text-gray-600">Role ID: <span className="text-gray-400 font-mono">{item.id}</span></p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
