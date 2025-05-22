import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { UserRole } from "@/types/UserRole";

const API_BASE_URL = "https://dev.backend.ikizamini.hillygeeks.com/api/v1";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: UserRole;
  address?: string;
  type?: string;
  phone?: string;
}

interface Organization {
  id: string;
  name: string;
  email: string;
  address: string;
  type: string;
  phone: string;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password?: string) => Promise<void>;
  register: (userData: Omit<User, "id" | "role">, password?: string) => Promise<void>;
  logout: () => void;
}

interface UserContextType {
  users: User[];
  admins: Organization[];
  organizationAdmins: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password?: string) => Promise<void>;
  register: (userData: Omit<User, "id" | "role">, password?: string) => Promise<void>;
  logout: () => void;
  sendInviteEmail: (email: string, role: UserRole) => Promise<void>;
  deleteUser: (userId: string) => void;
  loadUsers: () => Promise<void>;
  loadAdmins: () => Promise<void>;
  loadOrganizationAdmins: (organizationId: string) => Promise<void>;
  createUser: (userData: Omit<User, "id">) => Promise<void>;
  createAdmin: (adminData: Omit<Organization, "id">) => Promise<void>;
  createOrganizationAdmin: (organizationId: string, adminData: Omit<User, "id" | "role">) => Promise<void>;
  updateAdmin: (adminId: string, adminData: Omit<Organization, "id">) => Promise<void>;
  loadOrganizations: () => Promise<void>;
  createOrganization: (organizationData: Omit<Organization, "id">) => Promise<void>;
  updateOrganization: (organizationId: string, organizationData: Omit<Organization, "id">) => Promise<void>;
  deleteOrganization: (organizationId: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const UserContext = createContext<UserContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { user, token } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: Omit<User, "id" | "role">, password?: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        ...userData,
        password,
      });

      const { user, token } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
    const [admins, setAdmins] = useState<Organization[]>([]);
    const [organizationAdmins, setOrganizationAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, setCurrentUser, login, register, logout } =
    useContext(AuthContext) || {
      currentUser: null,
      setCurrentUser: () => {},
      login: async () => {},
      register: async () => {},
      logout: () => {},
    };

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token available");
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token available");
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("/admin/organizations");
      setAdmins(response.data);
    } catch (error) {
      console.error("Error loading admins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrganizationAdmins = async (organizationId: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token available");
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(`/admin/organizations/${organizationId}/admins`);
      setOrganizationAdmins(response.data);
    } catch (error) {
      console.error("Error loading organization admins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (userData: Omit<User, "id">) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token available");
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.post("/admin/users", userData);
      await loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAdmin = async (adminData: Omit<Organization, "id">) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token available");
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.post("/admin/organizations", adminData);
      await loadAdmins();
    } catch (error) {
      console.error("Error creating admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrganizationAdmin = async (organizationId: string, adminData: Omit<User, "id" | "role">) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token available");
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.post(`/admin/organizations/${organizationId}/admins`, adminData);
      await loadOrganizationAdmins(organizationId);
    } catch (error) {
      console.error("Error creating organization admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAdmin = async (adminId: string, adminData: Omit<Organization, "id">) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token available");
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.put(`/admin/organizations/${adminId}`, adminData);
      await loadAdmins();
    } catch (error) {
      console.error("Error updating admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendInviteEmail = async (email: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token available");
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.post("/admin/invite", { email, role });
    } catch (error) {
      console.error("Error sending invite email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token available");
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.delete(`/admin/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrganizations = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                console.error("No auth token available");
                return;
            }

            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            const response = await api.get("/admin/organizations");
            setAdmins(response.data);
        } catch (error) {
            console.error("Error loading organizations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const createOrganization = async (organizationData: Omit<Organization, "id">) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                console.error("No auth token available");
                return;
            }

            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            await api.post("/admin/organizations", organizationData);
            await loadOrganizations();
        } catch (error) {
            console.error("Error creating organization:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrganization = async (organizationId: string, organizationData: Omit<Organization, "id">) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                console.error("No auth token available");
                return;
            }

            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            await api.put(`/admin/organizations/${organizationId}`, organizationData);
            await loadOrganizations();
        } catch (error) {
            console.error("Error updating organization:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteOrganization = async (organizationId: string) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                console.error("No auth token available");
                return;
            }

            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            await api.delete(`/admin/organizations/${organizationId}`);
            setAdmins(prevAdmins) => prevAdmins.filter(admin => admin.id !== organizationId);
        } catch (error) {
            console.error("Error deleting organization:", error);
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <UserContext.Provider
      value={{
        users,
        admins,
        organizationAdmins,
        currentUser,
        setCurrentUser,
        login,
        register,
        logout,
        sendInviteEmail,
        deleteUser,
        loadUsers,
        loadAdmins,
        loadOrganizationAdmins,
        createUser,
        createAdmin,
        createOrganizationAdmin,
        updateAdmin,
        loadOrganizations,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useUsers() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}
