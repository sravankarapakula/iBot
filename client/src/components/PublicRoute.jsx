import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = sessionStorage.getItem("authToken");
  
  // If the user already has a token, prevent them from accessing the login/signup pages
  // and redirect them back to the dashboard with replace to avoid history stack issues.
  if (token) return <Navigate to="/dashboard" replace />;
  
  return children;
};

export default PublicRoute;
