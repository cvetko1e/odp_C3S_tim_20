import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { Layout } from "../layout/Layout";
import { Spinner } from "../ui/UI";

type Role = "guest" | "user" | "admin";

const roleRank: Record<Role, number> = {
  guest: 0,
  user: 1,
  admin: 2,
};

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole: Role;
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (requiredRole !== "guest" && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roleRank[role] < roleRank[requiredRole]) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};