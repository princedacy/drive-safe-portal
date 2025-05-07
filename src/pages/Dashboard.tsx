
import { useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { USER_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE } from "@/types/UserRole";

export default function Dashboard() {
  const { currentUser } = useAuth();
  
  // Dashboard content based on user role
  const renderDashboardContent = () => {
    if (currentUser?.role === ADMIN_ROLE || currentUser?.role === SUPER_ADMIN_ROLE) {
      // Admin or Super Admin dashboard
      return (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Exam Management</CardTitle>
              <CardDescription>Create and manage driving test exams</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Create, edit, and manage all your driving test exams from one central location.
              </p>
              <Button asChild>
                <Link to="/exams">
                  Manage Exams <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Add, remove, and assign exams to users. Set user roles and permissions.
              </p>
              <Button asChild>
                <Link to="/users">
                  Manage Users <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {currentUser?.role === SUPER_ADMIN_ROLE && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>Manage testing centers and admin accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Create and manage testing centers and assign administrator accounts.
                </p>
                <Button asChild>
                  <Link to="/admin-management">
                    Manage Admins <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      );
    } else if (currentUser?.role === USER_ROLE) {
      // Regular user dashboard
      return (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Exams</CardTitle>
              <CardDescription>Take your assigned driving tests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                View your assigned exams and take driving tests to improve your driving knowledge.
              </p>
              <Button asChild>
                <Link to="/my-exams">
                  View My Exams <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>My Results</CardTitle>
              <CardDescription>Review your past exam results</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Check your scores and review answers from previous attempts.
              </p>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No dashboard content available for your account type.</p>
        <Button asChild>
          <Link to="/profile">Manage Your Profile</Link>
        </Button>
      </div>
    );
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-2">Welcome{currentUser?.firstName ? `, ${currentUser.firstName}` : ''}</h1>
        <p className="text-muted-foreground mb-8">Here's what you can do today.</p>
        
        {renderDashboardContent()}
      </div>
    </MainLayout>
  );
}
