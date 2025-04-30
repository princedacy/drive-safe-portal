
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/context/AuthContext";

// Ensure the User type has the admin properties
export interface ExtendedUser extends User {
  address?: string;
  type?: string;
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<User["role"]>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Return loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions if roles are specified
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on role
    if (currentUser.role === "USER") {
      return <Navigate to="/my-exams" replace />;
    } else if (currentUser.role === "ADMIN") {
      return <Navigate to="/exams" replace />;
    } else if (currentUser.role === "SUPER_ADMIN") {
      return <Navigate to="/admin-management" replace />;
    }
    
    // Fallback to dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
