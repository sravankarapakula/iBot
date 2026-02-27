import { motion } from "framer-motion";


export default function ChatBubble({ role, content }) {
const isUser = role === "user";


return (
<motion.div
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
>
<div
className={`max-w-xl px-5 py-3 rounded-2xl shadow-md text-sm leading-relaxed whitespace-pre-line
${isUser
? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
: "bg-white text-gray-800 border"}`}
>
{content}
</div>
</motion.div>
);
}