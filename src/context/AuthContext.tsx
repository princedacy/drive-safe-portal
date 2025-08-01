import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { USER_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE, UserRole } from "@/types/UserRole";
import { API_URL } from "@/config";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  phone: string;
  role: UserRole;
  assignedExams?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean; // Add this property
  login: (email: string, password: string) => Promise<User>;
  signup: (firstName: string, lastName: string, phone: string, email: string, role: UserRole, password: string) => Promise<void>;
  logout: () => Promise<void>;
  magicLinkLogin: (token: string) => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Compute isAuthenticated based on token presence
  const isAuthenticated = !!token && !!currentUser;

  useEffect(() => {
    // Check for saved token and user in localStorage on init
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("ikizaminiUser");
    
    if (savedToken) {
      setToken(savedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem("ikizaminiUser");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    console.log('Login attempt with:', { email, password });
    try {
      // Use sign-in endpoint
      const response = await api.post('/auth/sign-in', {
        email,
        password,
      });
      
      console.log('Login response:', response.data);

      // Extract token from response
      const { data } = response.data;
      const authToken = data.token;
      
      // Save token and update axios default headers
      setToken(authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      localStorage.setItem("authToken", authToken);
      
      // Extract user info from JWT token (as a workaround for missing user endpoint)
      try {
        // Decode JWT token to get user information
        const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
        console.log('Decoded token payload:', tokenPayload);
        
        // Create a minimal user object from token data
        const user: User = {
          id: tokenPayload.id || '',
          email: email, // Use the email from login
          firstName: tokenPayload.firstName || '', // These might need to be populated later
          lastName: tokenPayload.lastName || '',
          name: tokenPayload.name || '',
          phone: tokenPayload.phone || '',
          role: tokenPayload.role as UserRole,
          assignedExams: [],
        };
        
        console.log('Created user object:', user);
        
        // Save user data
        setCurrentUser(user);
        localStorage.setItem("ikizaminiUser", JSON.stringify(user));
        
        // Return user data for immediate use
        return user;
      } catch (error) {
        console.error('Error extracting user data from token:', error);
        throw new Error('Failed to process user data after login');
      }
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
        isAuthenticated, // Add this property
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
