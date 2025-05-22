
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { SUPER_ADMIN_ROLE } from "@/types/UserRole";
import { useUsers } from "@/context/UserContext";

export default function Dashboard() {
  const { currentUser } = useAuth();
  // Only use users property from UserContext
  const { users } = useUsers();
  
  // Check if user is super admin
  const isSuperAdmin = currentUser?.role === SUPER_ADMIN_ROLE;

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium">Welcome</h2>
            <p className="text-muted-foreground mt-2">
              Welcome to the Ikizamini Admin Portal. Use the sidebar to navigate.
            </p>
          </div>
          
          <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium">Quick Links</h2>
            <ul className="mt-2 space-y-1">
              <li className="text-primary">
                <a href="/exams">Manage Exams</a>
              </li>
              <li className="text-primary">
                <a href="/users">Manage Users</a>
              </li>
              {isSuperAdmin && (
                <li className="text-primary">
                  <a href="/admin-management">Manage Organizations & Admins</a>
                </li>
              )}
            </ul>
          </div>
          
          <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium">System Stats</h2>
            <div className="mt-2">
              <p>Total Users: {users?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
