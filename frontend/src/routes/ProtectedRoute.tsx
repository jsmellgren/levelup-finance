import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-white/40">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
}
