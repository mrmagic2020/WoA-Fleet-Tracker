import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    sessionStorage.setItem("redirectAfterAuth", location.pathname);
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default PrivateRoute;
