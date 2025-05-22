
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE, UserRole } from "@/types/UserRole";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  // If authentication is still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has permission
  if (allowedRoles && currentUser) {
    const hasPermission = allowedRoles.includes(currentUser.role as UserRole);
    
    if (!hasPermission) {
      // For admins redirect to dashboard, for users redirect to my-exams
      const redirectPath = 
        currentUser.role === ADMIN_ROLE || currentUser.role === SUPER_ADMIN_ROLE
          ? "/dashboard"
          : "/my-exams";
          
      return <Navigate to={redirectPath} replace />;
    }
  }

  // If authenticated and authorized, render the protected route
  return <>{children}</>;
};
