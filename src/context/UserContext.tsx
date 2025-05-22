import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { USER_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE, UserRole } from "@/types/UserRole";

const API_BASE_URL = "https://dev.backend.ikizamini.hillygeeks.com/api/v1";

// Extended user type with admin properties
interface ExtendedUser {
  id: string;
  email: string;
  address?: string;
  type?: string;
  phone?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  assignedExams?: string[];
}

interface UserContextType {
  users: ExtendedUser[];
  admins: ExtendedUser[];
  organizationAdmins: ExtendedUser[];
  loadAdmins: () => Promise<void>;
  loadOrganizationAdmins: (organizationId: string) => Promise<void>;
  addUser: (user: Omit<ExtendedUser, "id">) => void;
  createAdmin: (adminData: Omit<ExtendedUser, "id" | "role" | "firstName" | "lastName">) => Promise<void>;
  createOrganizationAdmin: (organizationId: string, adminData: any) => Promise<void>;
  updateAdmin: (adminId: string, adminData: Partial<Omit<ExtendedUser, "id" | "role">>) => Promise<void>;
  updateUser: (user: ExtendedUser) => void;
  deleteUser: (userId: string) => void;
  sendInviteEmail: (email: string, role: UserRole) => Promise<void>;
  isLoading: boolean;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sample users
const MOCK_USERS: ExtendedUser[] = [
  {
    id: "1",
    email: "superadmin@example.com",
    firstName: "Super",
    lastName: "Admin",
    role: SUPER_ADMIN_ROLE,
    phone: "1234567890",
    name: "Super Admin",
  },
  {
    id: "3",
    email: "user1@example.com",
    firstName: "Test",
    lastName: "User 1",
    role: USER_ROLE,
    phone: "1234567890",
    name: "Test User 1",
    assignedExams: ["exam1", "exam2"],
  },
  {
    id: "4",
    email: "user2@example.com",
    firstName: "Test",
    lastName: "User 2",
    role: USER_ROLE,
    phone: "1234567890",
    name: "Test User 2",
    assignedExams: ["exam2"],
  },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [admins, setAdmins] = useState<ExtendedUser[]>([]);
  const [organizationAdmins, setOrganizationAdmins] = useState<ExtendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load mock users
    setUsers(MOCK_USERS);
    
    // Load real admin data
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        return;
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch admins from API
      const response = await api.get('/super/organizations', {
        params: {
          page: 0,
          limit: 100,
        }
      });
      
      console.log('Admin organizations response:', response.data);
      
      // Transform response data to match our ExtendedUser interface
      const adminUsers: ExtendedUser[] = response.data.data.map((admin: any) => ({
        id: admin.id || admin._id,
        email: admin.email,
        firstName: "",
        lastName: "",
        name: admin.name,
        role: ADMIN_ROLE,
        address: admin.address,
        type: admin.type,
        phone: admin.phone,
      }));
      
      setAdmins(adminUsers);
    } catch (error) {
      console.error('Error loading admin organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrganizationAdmins = async (organizationId: string) => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        return;
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch organization admins from API
      const response = await api.get(`/super/organizations/${organizationId}/users`, {
        params: {
          page: 0,
          limit: 100,
        }
      });
      
      console.log(`Organization ${organizationId} admins response:`, response.data);
      
      // Transform response data to match our ExtendedUser interface
      const orgAdmins: ExtendedUser[] = response.data.data.map((admin: any) => ({
        id: admin.id || admin._id,
        email: admin.email,
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
        name: admin.name,
        role: ADMIN_ROLE,
        address: admin.address,
        type: admin.type,
        phone: admin.phone,
      }));
      
      setOrganizationAdmins(orgAdmins);
    } catch (error) {
      console.error(`Error loading organization ${organizationId} admins:`, error);
      // Set empty array on error
      setOrganizationAdmins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = (userData: Omit<ExtendedUser, "id">) => {
    const newUser: ExtendedUser = {
      ...userData,
      id: `user${Date.now()}`,
    };
    
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const createAdmin = async (adminData: Omit<ExtendedUser, "id" | "role" | "firstName" | "lastName">) => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        throw new Error("Authentication required");
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Format phone number correctly
      let phone = adminData.phone || '';
      if (phone && !phone.startsWith('+')) {
        // If phone doesn't start with '+', add it
        // For phones starting with 0, replace it with +250
        if (phone.startsWith('0')) {
          phone = `+250${phone.substring(1)}`;
        } else {
          phone = `+${phone}`;
        }
      }
      
      // Create admin organization via API
      const response = await api.post('/super/organizations', {
        name: adminData.name,
        address: adminData.address,
        type: adminData.type,
        phone: phone,
        email: adminData.email,
      });
      
      console.log('Create admin organization response:', response.data);
      
      // Reload the admin list to get the newly created admin
      await loadAdmins();
      
      return response.data;
    } catch (error) {
      console.error('Error creating admin organization:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create organization admin
  const createOrganizationAdmin = async (organizationId: string, adminData: any) => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        throw new Error("Authentication required");
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Format phone number correctly
      let phone = adminData.phone || '';
      if (phone && !phone.startsWith('+')) {
        // If phone doesn't start with '+', add it
        // For phones starting with 0, replace it with +250
        if (phone.startsWith('0')) {
          phone = `+250${phone.substring(1)}`;
        } else {
          phone = `+${phone}`;
        }
      }
      
      // Create organization admin via API with the correct fields
      const response = await api.post(`/super/organizations/${organizationId}/users`, {
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        phone: phone,
        email: adminData.email,
        password: adminData.password,
      });
      
      console.log('Create organization admin response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error creating organization admin:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAdmin = async (adminId: string, adminData: Partial<Omit<ExtendedUser, "id" | "role">>) => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        throw new Error("Authentication required");
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Format phone number correctly if provided
      let phone = adminData.phone || '';
      if (phone && !phone.startsWith('+')) {
        // If phone doesn't start with '+', add it
        if (phone.startsWith('0')) {
          phone = `+250${phone.substring(1)}`;
        } else {
          phone = `+${phone}`;
        }
      }
      
      // Update admin via API - FIXED: Use correct endpoint structure
      const response = await api.put(`/super/organizations/${adminId}`, {
        name: adminData.name,
        address: adminData.address,
        type: adminData.type,
        phone: phone,
        email: adminData.email,
      });
      
      console.log('Update admin response:', response.data);
      
      // Reload the admin list to get the updated admin
      await loadAdmins();
      
      return response.data;
    } catch (error) {
      console.error('Error updating admin organization:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: ExtendedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== userId));
    setOrganizationAdmins((prevOrgAdmins) => prevOrgAdmins.filter((admin) => admin.id !== userId));
  };

  const sendInviteEmail = async (email: string, role: UserRole) => {
    // In a real app, this would call an API to send an email with a magic link
    // For demo purposes, we'll simulate this with a timeout
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Email invitation sent to ${email} for role ${role}`);
    
    // Create a placeholder user
    const newUser: ExtendedUser = {
      id: `user${Date.now()}`,
      email,
      firstName: email.split('@')[0], // Default first name from email
      lastName: "", // Empty last name as default
      name: email.split('@')[0], // Default name from email
      role,
      phone: "", // Empty phone as default
      assignedExams: [],
    };
    
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  return (
    <UserContext.Provider
      value={{
        users,
        admins,
        organizationAdmins,
        loadAdmins,
        loadOrganizationAdmins,
        addUser,
        createAdmin,
        createOrganizationAdmin,
        updateAdmin,
        updateUser,
        deleteUser,
        sendInviteEmail,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}
