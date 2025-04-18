import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

const API_BASE_URL = "https://dev.backend.ikizamini.hillygeeks.com/api/v1";

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
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved token and user in localStorage on init
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("driveSafeUser");
    
    if (savedToken) {
      setToken(savedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token: authToken, user } = response.data;
      
      // Save token and update axios default headers
      setToken(authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      localStorage.setItem("authToken", authToken);
      
      // Save user data
      setCurrentUser(user);
      localStorage.setItem("driveSafeUser", JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call success
      localStorage.removeItem("authToken");
      localStorage.removeItem("driveSafeUser");
      setCurrentUser(null);
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
      setIsLoading(false);
    }
  };

  const magicLinkLogin = async (token: string) => {
    // If your API supports magic link login, implement it here
    // For now, we'll keep it as a placeholder
    setIsLoading(true);
    try {
      // Add your magic link verification endpoint here
      console.warn('Magic link login not implemented with external API');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
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
        token,
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
