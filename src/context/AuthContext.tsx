
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

const API_BASE_URL = "https://dev.backend.ikizamini.hillygeeks.com/api/v1";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  assignedExams?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, phone: string, email: string, role: UserRole, password: string) => Promise<void>;
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
    const savedUser = localStorage.getItem("ikizaminiUser");
    
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
    console.log('Login attempt with:', { email, password });
    try {
      // Correct endpoint from '/auth/login' to '/auth/signin'
      const response = await api.post('/auth/signin', {
        email,
        password,
      });
      
      console.log('Login response:', response.data);

      const { token: authToken, user } = response.data;
      
      // Save token and update axios default headers
      setToken(authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      localStorage.setItem("authToken", authToken);
      
      // Save user data
      setCurrentUser(user);
      localStorage.setItem("ikizaminiUser", JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (firstName: string, lastName: string, phone: string, email: string, role: UserRole, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/signup', {
        firstName,
        lastName,
        phone,
        email,
        role,
        password,
      });

      const { token: authToken, user } = response.data;
      
      // Save token and update axios default headers
      setToken(authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      localStorage.setItem("authToken", authToken);
      
      // Save user data
      setCurrentUser(user);
      localStorage.setItem("ikizaminiUser", JSON.stringify(user));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // No need to call the API endpoint if you don't have a logout endpoint
      // Just clear local storage and state
      localStorage.removeItem("authToken");
      localStorage.removeItem("ikizaminiUser");
      setCurrentUser(null);
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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
        signup,
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
