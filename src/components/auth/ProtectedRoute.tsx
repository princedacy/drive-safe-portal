
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, User, UserRole } from "@/context/AuthContext";

// Ensure the User type has the admin properties
export interface ExtendedUser extends Omit<User, "phone"> {
  address?: string;
  type?: string;
  phone?: string;
  name?: string;
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<UserRole>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  console.log("Protected route check:", { 
    currentUser, 
    allowedRoles,
    path: location.pathname 
  });

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
    console.log("User not logged in, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions if roles are specified
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    console.log("User role not allowed:", currentUser.role, "Required:", allowedRoles);
    
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
