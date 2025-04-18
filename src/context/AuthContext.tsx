
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserRole = "superadmin" | "admin" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedExams?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  magicLinkLogin: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "superadmin@example.com",
    name: "Super Admin",
    role: "superadmin",
  },
  {
    id: "2",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "3",
    email: "user@example.com",
    name: "Test User",
    role: "user",
    assignedExams: ["exam1", "exam2"],
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage on init
    const savedUser = localStorage.getItem("driveSafeUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Find user with matching email
      const user = MOCK_USERS.find((u) => u.email === email);
      
      if (!user) {
        throw new Error("Invalid credentials");
      }
      
      // In a real app, you'd verify the password here
      // For demo, we'll just log in the user
      setCurrentUser(user);
      localStorage.setItem("driveSafeUser", JSON.stringify(user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setCurrentUser(null);
      localStorage.removeItem("driveSafeUser");
    } finally {
      setIsLoading(false);
    }
  };

  const magicLinkLogin = async (token: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, you'd verify the token with your backend
      // For demo, we'll just log in a test user
      const user = MOCK_USERS.find((u) => u.role === "user");
      
      if (!user) {
        throw new Error("Invalid magic link");
      }
      
      setCurrentUser(user);
      localStorage.setItem("driveSafeUser", JSON.stringify(user));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        logout,
        magicLinkLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
