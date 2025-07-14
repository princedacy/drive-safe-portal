
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Settings, FileQuestion, Users, BookOpen, Home, Menu, X, ChevronDown, BarChart3, Grid3X3, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from "@/types/UserRole";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <header className="bg-primary text-primary-foreground py-4 px-6 flex justify-between items-center shadow-sm border-b border-primary/10 sticky top-0 z-50">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-3 text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9 rounded-lg"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">Ikizamini</h1>
        </div>
      </header>
      
      <div className="flex flex-1 relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar */}
        {currentUser && (
          <div className={`
            fixed md:relative z-50 md:z-auto
            w-80 md:w-80
            h-full md:h-auto
            bg-sidebar text-sidebar-foreground 
            flex flex-col border-r border-sidebar-border shadow-xl md:shadow-none
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${!isSidebarOpen ? 'md:block hidden' : 'block'}
          `}>
            {/* User Profile Section */}
            <div className="p-6 border-b border-sidebar-border/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-sidebar-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sidebar-foreground truncate text-base">
                    {currentUser.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-sm text-sidebar-foreground/60 capitalize font-medium">
                    {currentUser.role?.toLowerCase() || 'user'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Quick Access */}
              <div className="p-6">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12 rounded-xl font-medium transition-all"
                    onClick={() => {
                      navigate("/dashboard");
                      closeSidebar();
                    }}
                  >
                    <Home className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Dashboard</span>
                  </Button>
                </div>
              </div>

              {/* Admin Section */}
              {isAdminOrAbove && (
                <div className="px-6 pb-6">
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                      Management
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12 rounded-xl font-medium transition-all"
                      onClick={() => {
                        navigate("/exams");
                        closeSidebar();
                      }}
                    >
                      <FileQuestion className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">Exams</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12 rounded-xl font-medium transition-all"
                      onClick={() => {
                        navigate("/users");
                        closeSidebar();
                      }}
                    >
                      <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">Users</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12 rounded-xl font-medium transition-all"
                      onClick={() => {
                        navigate("/admin-management");
                        closeSidebar();
                      }}
                    >
                      <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">Admins</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* User Section */}
              {currentUser.role === "USER" && (
                <div className="px-6 pb-6">
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                      My Learning
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12 rounded-xl font-medium transition-all"
                      onClick={() => {
                        navigate("/my-exams");
                        closeSidebar();
                      }}
                    >
                      <BookOpen className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">My Exams</span>
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Push content to bottom */}
              <div className="flex-1"></div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-sidebar-border/50">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12 rounded-xl font-medium transition-all"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Sign Out</span>
              </Button>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 bg-background p-6 lg:p-8 overflow-auto min-h-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
