
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE } from "@/types/UserRole";

export default function Index() {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Redirect based on user role
      if (currentUser.role === USER_ROLE) {
        navigate("/my-exams");
      } else if (currentUser.role === ADMIN_ROLE || currentUser.role === SUPER_ADMIN_ROLE) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Loading state
  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
