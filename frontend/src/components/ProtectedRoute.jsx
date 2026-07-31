import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;