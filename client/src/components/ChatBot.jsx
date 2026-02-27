import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Hello! How can I assist you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (input.trim()) {
      const userMsg = {
        from: 'user',
        text: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      try {
        const res = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        });

        const data = await res.json();
        const botReply = {
          from: 'bot',
          text: data.reply || "⚠️ No response from AI.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botReply]);
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: '⚠️ Error contacting AI server.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-full p-4">
      <div className="max-w-md w-full rounded-2xl shadow-2xl p-6 bg-black/40 backdrop-blur-xl border border-white/10 h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
          <h2 className="font-semibold text-lg text-white flex items-center gap-2">
            🤖 AI ChatBot Interface
          </h2>
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto mb-4 p-2 space-y-3 custom-scrollbar">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-xl max-w-[85%] ${msg.from === 'bot'
                    ? 'bg-white/10 text-white self-start rounded-tl-none'
                    : 'bg-blue-600 text-white self-end ml-auto text-right rounded-tr-none shadow-lg'
                  }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <p className="text-xs mt-1 text-white/50">{msg.time}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && <div className="italic text-sm text-gray-400 pl-2">Bot is typing...</div>}
        </div>

        {/* Input area */}
        <div className="flex space-x-2 pt-2 border-t border-white/10">
          <input
            type="text"
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition shadow-lg font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
