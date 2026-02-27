// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import AnoAI from "../components/ui/animated-shader-background";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen flex flex-col relative text-gray-100 scroll-smooth overflow-x-hidden">
      {/* Background Component */}
      <div className="fixed inset-0 z-0">
        <AnoAI />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full flex-1 flex flex-col">
        {/* ✅ Navbar */}
        <header className="flex justify-between items-center px-6 md:px-12 py-5 shadow-lg bg-black/20 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
          <div className="text-2xl font-bold tracking-wide text-white">
            Interview Companion
          </div>
          <nav className="space-x-3 md:space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded border border-blue-400 text-blue-300 hover:bg-blue-500/20 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-400 hover:to-indigo-500 transition shadow-md"
            >
              Sign Up
            </Link>
          </nav>
        </header>

        {/* ✅ Hero Section */}
        <motion.section
          className="flex flex-col items-center text-center px-6 py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 leading-tight drop-shadow-md">
            Prepare Smarter. <br /> Interview Better.
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-gray-300 mb-10 leading-relaxed">
            Practice interviews, upload resumes, and get tailored guidance for your dream job.
            Your one-stop platform to improve your interview confidence.
          </p>
          <Link
            to="/signup"
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 transition transform hover:scale-105"
          >
            Get Started
          </Link>
        </motion.section>

        {/* ✅ Features Section */}
        <section className="py-16 px-6 max-w-6xl mx-auto w-full">
          <motion.h2
            className="text-3xl font-bold text-center mb-12 text-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            Platform Highlights
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "AI Mock Interviews", desc: "Simulate real interviews with adaptive AI questions." },
              { title: "Resume Analysis", desc: "Get instant feedback and keyword matching for your resume." },
              { title: "Role-Specific Prep", desc: "Tailored questions for Frontend, Backend, DevOps, etc." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="p-8 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md hover:bg-white/10 transition border border-white/10 flex flex-col items-center text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h3 className="text-xl font-bold mb-3 text-blue-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ✅ Testimonials Section */}
        <section className="py-16 px-6">
          <motion.h2
            className="text-3xl font-bold text-center mb-12 text-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            What Users Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[{
              name: "Arjun",
              feedback: "The mock interview feature boosted my confidence tremendously!"
            }, {
              name: "Sneha",
              feedback: "I loved the resume feedback — it helped me land my first job."
            }, {
              name: "Ravi",
              feedback: "The interface is clean and the insights are super useful. Highly recommend!"
            }].map((t, idx) => (
              <motion.div
                key={idx}
                className="p-6 bg-white/5 rounded-xl shadow-lg border border-white/10 hover:bg-white/10 transition text-center backdrop-blur-md"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <p className="italic text-gray-300 mb-4 text-lg">“{t.feedback}”</p>
                <h4 className="font-semibold text-blue-400">– {t.name}</h4>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ✅ FAQ Section */}
        <section className="py-16 px-6 max-w-4xl mx-auto w-full">
          <motion.h2
            className="text-3xl font-bold text-center mb-10 text-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {[{
              q: "Is this platform free to use?",
              a: "Yes, basic features are completely free. Premium features may be added later.",
            },
            {
              q: "Can I practice multiple times?",
              a: "Of course! You can take unlimited mock interviews to sharpen your skills.",
            },
            {
              q: "Do I need to upload my resume?",
              a: "It's optional but recommended for personalized interview questions.",
            }].map((faq, idx) => (
              <motion.div
                key={idx}
                className="bg-white/5 p-6 rounded-xl shadow-lg border border-white/10 backdrop-blur-md hover:bg-white/10 transition"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h4 className="font-bold text-blue-300 text-lg mb-2">{faq.q}</h4>
                <p className="text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ✅ Footer */}
        <footer className="bg-black/40 backdrop-blur-md text-gray-400 text-center py-8 mt-auto border-t border-white/10">
          <p>© {new Date().getFullYear()} Interview Companion. All rights reserved.</p>
          <div className="mt-4 space-x-6">
            <Link to="/about" className="hover:text-blue-400 transition">About</Link>
            <Link to="/contact" className="hover:text-blue-400 transition">Contact</Link>
            <Link to="/privacy" className="hover:text-blue-400 transition">Privacy Policy</Link>
          </div>
        </footer>
      </div>

      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-2xl transition z-50 ring-2 ring-blue-400/50"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}
