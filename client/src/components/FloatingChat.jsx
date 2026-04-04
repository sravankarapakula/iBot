// src/components/FloatingChat.jsx
// iBot — persistent floating AI chat, bottom-right.
// Enhancements: active dot, close-resets-messages, 6-msg context window,
// conversation-history payload, max_tokens=130, 1.5s request cooldown.
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, ChevronDown, Send, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Maximum number of UI messages to send as context (excludes welcome)
const CONTEXT_WINDOW = 6;
// Minimum ms between successive sends
const SEND_COOLDOWN_MS = 1500;

function makeWelcome() {
  return {
    from: "bot",
    text: "Hey! I'm your AI interview assistant 👋 Ask me anything about roles, stacks, interview prep, or resume tips.",
    time: ts(),
  };
}

function ts() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Convert UI message list to OpenAI-style roles (skip welcome/system messages) */
function toApiMessages(msgs) {
  return msgs
    .filter((m) => m._skip !== true)          // exclude the welcome message
    .slice(-CONTEXT_WINDOW)                   // keep last 6 only
    .map((m) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.text,
    }));
}

export default function FloatingChat() {
  // ── Core state ───────────────────────────────────────────────────────────────
  const [isOpen,      setIsOpen]      = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages,    setMessages]    = useState([{ ...makeWelcome(), _skip: true }]);
  const [input,       setInput]       = useState("");
  const [isTyping,    setIsTyping]    = useState(false);

  // Refs
  const bottomRef      = useRef(null);
  const inputRef       = useRef(null);
  const lastSentAt     = useRef(0); // timestamp of last successful send

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // ── Focus input on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const t = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(t);
    }
  }, [isOpen, isMinimized]);

  // ── Controls ─────────────────────────────────────────────────────────────────
  const handleToggle = () => {
    if (!isOpen) {
      // Fully closed → open fresh
      setIsOpen(true);
      setIsMinimized(false);
    } else if (isMinimized) {
      // Minimized → reopen with preserved messages
      setIsMinimized(false);
    }
    // If already open and not minimized: do nothing (user must use ↓ to minimize)
  };

  const handleMinimize = () => setIsMinimized(true);

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    // Reset conversation on explicit close
    setMessages([{ ...makeWelcome(), _skip: true }]);
    setInput("");
    setIsTyping(false);
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    // Rate-limit: enforce cooldown
    const now = Date.now();
    if (now - lastSentAt.current < SEND_COOLDOWN_MS) return;
    lastSentAt.current = now;

    // Optimistically add user message
    const userMsg = { from: "user", text, time: ts() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Build recent context — use messages BEFORE adding the new user msg
    // so we capture the prior exchange correctly
    setMessages((prev) => {
      // prev already includes userMsg (set just above via first setMessages)
      // We build context from all non-skip messages
      const context = toApiMessages(prev);

      // Fire async — we're inside a setState callback so use a closure
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: context }),
          });
          const data = await res.json();
          const botMsg = {
            from: "bot",
            text: data.reply || "⚠️ No response from AI.",
            time: ts(),
          };
          setMessages((m) => [...m, botMsg]);
        } catch {
          setMessages((m) => [
            ...m,
            { from: "bot", text: "⚠️ Could not reach AI server.", time: ts() },
          ]);
        } finally {
          setIsTyping(false);
        }
      })();

      return prev; // no change from this setState — it was just for context capture
    });
  }, [input, isTyping]);

  // Simpler: avoid setState-in-setState pattern — refactor sendMessage cleanly
  // (React batches — the above pattern is unreliable; use a ref for messages instead)
  // ↓ Clean implementation below (replaces the useCallback above):

  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    // Cooldown guard
    const now = Date.now();
    if (now - lastSentAt.current < SEND_COOLDOWN_MS) return;
    lastSentAt.current = now;

    // Add user message to UI
    const userMsg = { from: "user", text, time: ts() };
    const nextMessages = [...messagesRef.current, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    // Build context from the updated list
    const context = toApiMessages(nextMessages);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: context }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.reply || "⚠️ No response from AI.", time: ts() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Could not reach AI server.", time: ts() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  // Active session = open OR minimized (messages exist beyond welcome)
  const hasSession  = isOpen;
  // Dot: visible only when minimized with an active session
  const showDot     = isOpen && isMinimized;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══════════════════════════════════════════════════
          CHAT WINDOW
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 22, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 22, scale: 0.94 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position:     "fixed",
              right:        "22px",
              bottom:       "86px",
              width:        "360px",
              height:       "520px",
              maxHeight:    "80vh",
              zIndex:       9999,
              display:      "flex",
              flexDirection:"column",
              borderRadius: "18px",
              overflow:     "hidden",
              border:       "1px solid rgba(255,255,255,0.08)",
              background:   "rgba(9,9,16,0.84)",
              backdropFilter:        "blur(14px)",
              WebkitBackdropFilter:  "blur(14px)",
              boxShadow:    "0 8px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* ── Header ── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.025)",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 14px rgba(139,92,246,0.45)",
                }}>
                  <Bot size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1 }}>AI Assistant</p>
                  <p style={{ color: "#4ade80", fontSize: 10, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                    Online
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <HeaderBtn onClick={handleMinimize} title="Minimize">
                  <ChevronDown size={14} />
                </HeaderBtn>
                <HeaderBtn onClick={handleClose} title="Close" danger>
                  <X size={14} />
                </HeaderBtn>
              </div>
            </div>

            {/* ── Messages ── */}
            <div style={{
              flex: 1, overflowY: "auto",
              padding: "14px 14px 6px",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      display: "flex", flexDirection: "column",
                      alignItems:  msg.from === "user" ? "flex-end" : "flex-start",
                      alignSelf:   msg.from === "user" ? "flex-end" : "flex-start",
                      maxWidth:    "84%",
                    }}
                  >
                    <div style={{
                      padding:      "9px 13px",
                      borderRadius: msg.from === "bot"
                        ? "4px 14px 14px 14px"
                        : "14px 4px 14px 14px",
                      background:   msg.from === "bot"
                        ? "rgba(255,255,255,0.07)"
                        : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                      color:        "#f1f5f9",
                      fontSize:     13,
                      lineHeight:   1.56,
                      boxShadow:    msg.from === "user"
                        ? "0 2px 10px rgba(99,102,241,0.28)"
                        : "none",
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 4 }}>
                      {msg.time}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Thinking indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}
                >
                  <Loader2 size={12} style={{ animation: "spin 1s linear infinite", color: "#6366f1" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>Thinking…</span>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Input bar ── */}
            <div style={{
              padding: "10px 12px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex", gap: 8, flexShrink: 0,
              background: "rgba(255,255,255,0.015)",
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={isTyping}
                placeholder={isTyping ? "Waiting for response…" : "Ask anything…"}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                  padding: "9px 13px",
                  color: "#f1f5f9",
                  fontSize: 13,
                  outline: "none",
                  transition: "border-color 0.15s, opacity 0.15s",
                  opacity: isTyping ? 0.55 : 1,
                }}
                onFocus={(e)  => { e.target.style.borderColor = "rgba(99,102,241,0.55)"; }}
                onBlur={(e)   => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || isTyping}
                style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                  border: "none",
                  cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: input.trim() && !isTyping ? 1 : 0.38,
                  boxShadow: "0 0 12px rgba(99,102,241,0.32)",
                  transition: "opacity 0.15s, transform 0.12s",
                }}
                onMouseEnter={(e) => { if (input.trim() && !isTyping) e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Send size={15} color="#fff" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          iBOT TRIGGER BUTTON
      ══════════════════════════════════════════════════ */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        title={isMinimized ? "Reopen chat" : "Open AI chat"}
        style={{
          position: "fixed", right: 22, bottom: 22,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          border: "1px solid rgba(255,255,255,0.14)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10000,
          boxShadow: showDot
            ? "0 0 0 2px rgba(74,222,128,0.6), 0 6px 24px rgba(99,102,241,0.50)"
            : "0 4px 20px rgba(99,102,241,0.40), 0 0 0 1px rgba(255,255,255,0.07)",
          transition: "box-shadow 0.3s",
        }}
      >
        <Bot size={22} color="#fff" />

        {/* ── Active session dot (minimized only) ── */}
        <AnimatePresence>
          {showDot && (
            <motion.span
              key="dot"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{    scale: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute",
                top: 5, right: 5,
                width: 8, height: 8,
                borderRadius: "50%",
                background: "#4ade80",           // soft green
                border: "2px solid #0d0d1a",
                boxShadow: "0 0 6px rgba(74,222,128,0.7)",
              }}
            />
          )}
        </AnimatePresence>

        {/* ── Pulse ring when minimized ── */}
        {isOpen && isMinimized && (
          <motion.span
            key="pulse"
            animate={{ scale: [1, 1.65], opacity: [0.55, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            style={{
              position: "absolute", inset: 0,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.45)",
              pointerEvents: "none",
            }}
          />
        )}
      </motion.button>

      {/* Spin keyframe for Loader2 */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ── Small header button ───────────────────────────────────────────────────────
function HeaderBtn({ onClick, title, danger, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 8,
        background: "rgba(255,255,255,0.06)",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: danger ? "rgba(248,113,113,0.8)" : "rgba(255,255,255,0.5)",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "rgba(248,113,113,0.15)"
          : "rgba(255,255,255,0.12)";
        e.currentTarget.style.color = danger ? "#f87171" : "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.color = danger ? "rgba(248,113,113,0.8)" : "rgba(255,255,255,0.5)";
      }}
    >
      {children}
    </button>
  );
}
