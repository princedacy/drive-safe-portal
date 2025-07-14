
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Settings, FileQuestion, Users, BookOpen, Home, Menu, X } from "lucide-react";
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
      <header className="bg-primary text-primary-foreground py-3 px-4 sm:px-6 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 text-primary-foreground hover:bg-primary hover:text-primary-foreground h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          <h1 className="text-lg sm:text-xl font-bold truncate">Ikizamini</h1>
        </div>
        
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuLabel className="font-normal text-sm truncate">{currentUser.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
            fixed md:relative z-50 md:z-auto
            w-64 sm:w-72 md:w-64 lg:w-72
            h-full md:h-auto
            bg-sidebar text-sidebar-foreground 
            flex flex-col border-r shadow-lg md:shadow-sm
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${!isSidebarOpen ? 'md:block hidden' : 'block'}
          `}>
            <nav className="p-3 sm:p-4 flex-1 overflow-y-auto flex flex-col">
              <ul className="space-y-1 sm:space-y-2 flex-1">
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground text-sm sm:text-base h-9 sm:h-10"
                    onClick={() => {
                      navigate("/dashboard");
                      closeSidebar();
                    }}
                  >
                    <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">Dashboard</span>
                  </Button>
                </li>
                
                {isAdminOrAbove && (
                  <>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground text-sm sm:text-base h-9 sm:h-10"
                        onClick={() => {
                          navigate("/exams");
                          closeSidebar();
                        }}
                      >
                        <FileQuestion className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="truncate">Manage Exams</span>
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground text-sm sm:text-base h-9 sm:h-10"
                        onClick={() => {
                          navigate("/users");
                          closeSidebar();
                        }}
                      >
                        <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="truncate">Manage Users</span>
                      </Button>
                    </li>
                  </>
                )}
                
                {currentUser.role === "USER" && (
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground text-sm sm:text-base h-9 sm:h-10"
                      onClick={() => {
                        navigate("/my-exams");
                        closeSidebar();
                      }}
                    >
                      <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="truncate">My Exams</span>
                    </Button>
                  </li>
                )}
                
                {isAdminOrAbove && (
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground text-sm sm:text-base h-9 sm:h-10"
                      onClick={() => {
                        navigate("/admin-management");
                        closeSidebar();
                      }}
                    >
                      <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="truncate">Manage Admins</span>
                    </Button>
                  </li>
                )}
              </ul>
            </nav>
            <div className="p-3 sm:p-4 text-xs sm:text-sm border-t mt-auto">
              <p className="truncate">Logged in as: {currentUser.role}</p>
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
