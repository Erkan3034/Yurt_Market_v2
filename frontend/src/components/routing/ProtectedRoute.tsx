import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { authStore } from "../../store/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: "seller" | "student";
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const user = authStore((state) => state.user);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const isAdmin = user.role === "admin";
  if (role && user.role !== role && !isAdmin) {
    return <Navigate to={user.role === "seller" ? "/seller/products" : "/app/explore"} replace />;
  }

  return <>{children}</>;
};

