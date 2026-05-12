import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    sessionStorage.clear();
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
