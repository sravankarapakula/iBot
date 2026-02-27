import React from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function AuthLayout() {
  const location = useLocation();
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center ${
        isAuthPage
          ? "bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200"
          : "bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-900"
      }`}
    >
      <Outlet />
    </div>
  );
}
