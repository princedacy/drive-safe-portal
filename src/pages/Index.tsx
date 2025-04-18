
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Redirect to appropriate page based on authentication status and role
export default function Index() {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.role === "user") {
      navigate("/my-exams");
    } else if (currentUser.role === "admin") {
      navigate("/exams");
    } else if (currentUser.role === "superadmin") {
      navigate("/admin-management");
    } else {
      navigate("/dashboard");
    }
  }, [currentUser, isLoading, navigate]);

  // Return a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
