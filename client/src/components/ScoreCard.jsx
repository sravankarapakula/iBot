import { motion } from "framer-motion";


export default function ScoreCard({ score, strengths, weaknesses, improvedAnswer }) {
return (
<motion.div
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
className="bg-white rounded-2xl shadow-lg p-6 border mt-6"
>
<h3 className="text-xl font-bold text-gray-800 mb-2">
Interview Feedback
</h3>


<p className="text-lg font-semibold text-indigo-600 mb-4">
Score: {score}/10
</p>


<div className="mb-3">
<h4 className="font-semibold text-green-600">Strengths</h4>
<ul className="list-disc ml-5 text-gray-700 text-sm">
{strengths && strengths.map((s, i) => (
<li key={i}>{s}</li>
))}
</ul>
</div>


<div className="mb-3">
<h4 className="font-semibold text-red-500">Areas to Improve</h4>
<ul className="list-disc ml-5 text-gray-700 text-sm">
{weaknesses && weaknesses.map((w, i) => (
<li key={i}>{w}</li>
))}
</ul>
</div>


{improvedAnswer && (
<div>
<h4 className="font-semibold text-blue-600">
Suggested Improved Answer
</h4>
<p className="text-gray-700 text-sm mt-1 whitespace-pre-line">
{improvedAnswer}
</p>
</div>
)}
</motion.div>
);
}