import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const location = useLocation();

  // ❌ Hide navbar on login, signup, and home pages
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
    return null;
  }

  const linkClasses = (path) =>
    location.pathname === path
      ? "font-semibold text-blue-400 underline underline-offset-4"
      : "hover:underline text-white transition-colors";

  return (
    <nav className="bg-black p-4 text-white flex justify-between items-center">
      <div className="font-bold text-lg">AI-Interview-Bot</div>
      <div className="space-x-6">
        {/* ✅ Only show Dashboard link if not already on /dashboard */}
        {location.pathname !== '/dashboard' && (
          <Link to="/dashboard" className={linkClasses('/dashboard')}>
            Dashboard
          </Link>
        )}
        <Link to="/interview" className={linkClasses('/interview')}>
          Interview
        </Link>
        <Link to="/chat" className={linkClasses('/chat')}>
          ChatBot
        </Link>
      </div>
    </nav>
  );
}
