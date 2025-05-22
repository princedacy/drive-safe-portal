
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Settings, FileQuestion, Users, BookOpen, Home } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isAdminOrAbove = currentUser?.role === ADMIN_ROLE || currentUser?.role === SUPER_ADMIN_ROLE;
  const isSuperAdmin = currentUser?.role === SUPER_ADMIN_ROLE;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <h1 className="text-xl font-bold">Ikizamini Portal</h1>
        </div>
        
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <User className="h-5 w-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuLabel className="font-normal text-sm">{currentUser.email}</DropdownMenuLabel>
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
      
      <div className="flex flex-1">
        {/* Sidebar */}
        {currentUser && isSidebarOpen && (
          <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r shadow-sm">
            <nav className="p-4 flex-1">
              <ul className="space-y-2">
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    onClick={() => navigate("/")}
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Dashboard
                  </Button>
                </li>
                
                {isAdminOrAbove && (
                  <>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        onClick={() => navigate("/exams")}
                      >
                        <FileQuestion className="mr-2 h-5 w-5" />
                        Manage Exams
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        onClick={() => navigate("/users")}
                      >
                        <Users className="mr-2 h-5 w-5" />
                        Manage Users
                      </Button>
                    </li>
                  </>
                )}
                
                {currentUser.role === "USER" && (
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      onClick={() => navigate("/my-exams")}
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      My Exams
                    </Button>
                  </li>
                )}
                
                {isSuperAdmin && (
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      onClick={() => navigate("/admin-management")}
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Manage Admins
                    </Button>
                  </li>
                )}
              </ul>
            </nav>
            <div className="p-4 text-sm">
              <p>Logged in as: {currentUser.role}</p>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 bg-background p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
