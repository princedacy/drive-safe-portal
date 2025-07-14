
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Settings, FileQuestion, Users, BookOpen, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from "@/types/UserRole";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isAdminOrAbove = currentUser?.role === ADMIN_ROLE || currentUser?.role === SUPER_ADMIN_ROLE;
  const isSuperAdmin = currentUser?.role === SUPER_ADMIN_ROLE;

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center shadow-sm sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-4 text-primary-foreground hover:bg-primary-foreground/10 h-10 w-10"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Ikizamini</h1>
      </header>
      
      <div className="flex flex-1 relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar */}
        {currentUser && (
          <div className={`
            ${isSidebarExpanded ? 'w-80' : 'w-20'}
            bg-sidebar text-sidebar-foreground 
            flex flex-col border-r border-sidebar-border shadow-sm
            transition-all duration-300 ease-in-out
          `}>
            {/* User Profile Section */}
            {isSidebarExpanded && (
              <div className="p-6 border-b border-sidebar-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-sidebar-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sidebar-foreground truncate">
                      {currentUser.email?.split('@')[0] || 'User'}
                    </h3>
                    <p className="text-xs text-sidebar-foreground/70 capitalize">
                      {currentUser.role?.toLowerCase() || 'user'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Content */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Quick Access */}
              <div className={`${isSidebarExpanded ? 'p-6' : 'p-3'}`}>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className={`w-full h-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}
                    onClick={() => {
                      navigate("/dashboard");
                      closeSidebar();
                    }}
                  >
                    <Home className={`h-4 w-4 flex-shrink-0 ${isSidebarExpanded ? 'mr-3' : ''}`} />
                    {isSidebarExpanded && <span>Dashboard</span>}
                  </Button>
                </div>
              </div>

              {/* Admin Section */}
              {isAdminOrAbove && (
                <div className={`${isSidebarExpanded ? 'px-6' : 'px-3'} pb-6`}>
                  {isSidebarExpanded && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                        Management
                      </h4>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className={`w-full h-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}
                      onClick={() => {
                        navigate("/exams");
                        closeSidebar();
                      }}
                    >
                      <FileQuestion className={`h-4 w-4 flex-shrink-0 ${isSidebarExpanded ? 'mr-3' : ''}`} />
                      {isSidebarExpanded && <span>Exams</span>}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full h-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}
                      onClick={() => {
                        navigate("/users");
                        closeSidebar();
                      }}
                    >
                      <Users className={`h-4 w-4 flex-shrink-0 ${isSidebarExpanded ? 'mr-3' : ''}`} />
                      {isSidebarExpanded && <span>Users</span>}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full h-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}
                      onClick={() => {
                        navigate("/admin-management");
                        closeSidebar();
                      }}
                    >
                      <Settings className={`h-4 w-4 flex-shrink-0 ${isSidebarExpanded ? 'mr-3' : ''}`} />
                      {isSidebarExpanded && <span>Admins</span>}
                    </Button>
                  </div>
                </div>
              )}

              {/* User Section */}
              {currentUser.role === "USER" && (
                <div className={`${isSidebarExpanded ? 'px-6' : 'px-3'} pb-6`}>
                  {isSidebarExpanded && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                        My Learning
                      </h4>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className={`w-full h-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}
                      onClick={() => {
                        navigate("/my-exams");
                        closeSidebar();
                      }}
                    >
                      <BookOpen className={`h-4 w-4 flex-shrink-0 ${isSidebarExpanded ? 'mr-3' : ''}`} />
                      {isSidebarExpanded && <span>My Exams</span>}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Push content to bottom */}
              <div className="flex-1"></div>
            </div>
            
            {/* Footer */}
            <div className={`${isSidebarExpanded ? 'p-6' : 'p-3'} border-t border-sidebar-border`}>
              <Button
                variant="ghost"
                className={`w-full h-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}
                onClick={handleLogout}
              >
                <LogOut className={`h-4 w-4 flex-shrink-0 ${isSidebarExpanded ? 'mr-3' : ''}`} />
                {isSidebarExpanded && <span>Sign Out</span>}
              </Button>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 bg-background p-3 sm:p-4 lg:p-6 overflow-auto min-h-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
