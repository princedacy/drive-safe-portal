
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { SUPER_ADMIN_ROLE } from "@/types/UserRole";
import { useUsers } from "@/context/UserContext";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default function Dashboard() {
  const { currentUser } = useAuth();
  // Only use users property from UserContext
  const { users } = useUsers();
  
  // Check if user is super admin
  const isSuperAdmin = currentUser?.role === SUPER_ADMIN_ROLE;

  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform performance</p>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Exams"
            value="145,679"
            change={20}
          />
          <MetricCard
            title="Candidates"
            value="10,289"
            change={-5}
          />
          <MetricCard
            title="Organizations"
            value="140"
            change={-3}
          />
          <MetricCard
            title="Certifications"
            value="680"
            change={12}
          />
        </div>
        
        {/* Additional content can go here */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <p className="text-muted-foreground">Activity feed will be displayed here</p>
          </div>
          
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-border/50 hover:bg-accent hover:text-accent-foreground transition-colors">
                Create New Exam
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-border/50 hover:bg-accent hover:text-accent-foreground transition-colors">
                Manage Users
              </button>
              {isSuperAdmin && (
                <button className="w-full text-left p-3 rounded-lg border border-border/50 hover:bg-accent hover:text-accent-foreground transition-colors">
                  Organization Settings
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
