import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ExamProvider } from "@/context/ExamContext";
import { UserProvider } from "@/context/UserContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import MagicLinkLogin from "./pages/MagicLinkLogin";
import ExamsManagement from "./pages/ExamsManagement";
import CreateExam from "./pages/CreateExam";
import AssignExam from "./pages/AssignExam";
import UsersManagement from "./pages/UsersManagement";
import AdminManagement from "./pages/AdminManagement";
import UserExams from "./pages/UserExams";
import TakeExam from "./pages/TakeExam";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ExamProvider>
          <UserProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/magic-login" element={<MagicLinkLogin />} />
                
                {/* Protected routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin routes */}
                <Route 
                  path="/exams" 
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <ExamsManagement />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/exams/create" 
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CreateExam />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/exams/edit/:examId" 
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CreateExam />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/exams/assign/:examId" 
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <AssignExam />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <UsersManagement />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Super admin routes */}
                <Route 
                  path="/admin-management" 
                  element={
                    <ProtectedRoute allowedRoles={["superadmin"]}>
                      <AdminManagement />
                    </ProtectedRoute>
                  } 
                />
                
                {/* User routes */}
                <Route 
                  path="/my-exams" 
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <UserExams />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/take-exam/:examId" 
                  element={
                    <ProtectedRoute>
                      <TakeExam />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </UserProvider>
        </ExamProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
