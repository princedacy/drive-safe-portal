
import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { API_URL } from "@/config";
import { UserRole } from "@/types/UserRole";

// Define the User interface
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  organizationId: string;
  name?: string;
}

// Define the Organization interface
interface Organization {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

interface UserContextType {
  users: User[];
  fetchUsers: () => Promise<void>;
  sendInviteEmail: (email: string, role: UserRole) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  createOrganizationAdmin: (
    organizationId: string,
    adminData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone: string;
    }
  ) => Promise<any>;
  // Add missing organization-related properties
  organizations: Organization[];
  loadOrganizations: () => Promise<void>;
  createOrganization: (organizationData: Partial<Organization>) => Promise<any>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<any>;
  deleteOrganization: (id: string) => Promise<void>;
  loadOrganizationAdmins: (organizationId: string) => Promise<void>;
  organizationAdmins: User[];
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationAdmins, setOrganizationAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token: userToken } = useAuth();

  const fetchUsers = async () => {
    if (!userToken) {
      console.log("No auth token available, skipping user fetch");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/super/users`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const loadOrganizations = async () => {
    if (!userToken) {
      console.log("No auth token available, skipping organizations fetch");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/super/organizations`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error("Error loading organizations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrganization = async (organizationData: Partial<Organization>) => {
    try {
      const response = await fetch(`${API_URL}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(organizationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create organization");
      }

      const data = await response.json();
      // Refresh the organizations list
      loadOrganizations();
      return data;
    } catch (error) {
      console.error("Error creating organization:", error);
      throw error;
    }
  };

  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    try {
      const response = await fetch(`${API_URL}/organizations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update organization");
      }

      const responseData = await response.json();
      // Refresh the organizations list
      loadOrganizations();
      return responseData;
    } catch (error) {
      console.error("Error updating organization:", error);
      throw error;
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/organizations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete organization");
      }

      // Refresh the organizations list
      loadOrganizations();
    } catch (error) {
      console.error("Error deleting organization:", error);
      throw error;
    }
  };

  const loadOrganizationAdmins = async (organizationId: string) => {
    if (!userToken) {
      console.log("No auth token available, skipping admins fetch");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/organizations/${organizationId}/users`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrganizationAdmins(data);
    } catch (error) {
      console.error("Error loading organization admins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendInviteEmail = async (email: string, role: UserRole) => {
    if (!userToken) {
      throw new Error("No authentication token found");
    }
    
    try {
      const response = await fetch(`${API_URL}/super/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error sending invite email:", errorData);
        throw new Error(errorData.message || "Failed to send invite email");
      }

      const data = await response.json();
      console.log("Invite email sent successfully:", data);
    } catch (error) {
      console.error("Error sending invite email:", error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    if (!userToken) {
      throw new Error("No authentication token found");
    }
    
    try {
      const response = await fetch(`${API_URL}/super/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error deleting user:", errorData);
        throw new Error(errorData.message || "Failed to delete user");
      }

      // Optimistically update the state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const createOrganizationAdmin = async (
    organizationId: string,
    adminData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone: string;
    }
  ) => {
    if (!userToken) {
      throw new Error("No authentication token found");
    }
    
    try {
      const response = await fetch(`${API_URL}/super/organizations/${organizationId}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating organization admin:", errorData);
        throw new Error(errorData.message || "Failed to create organization admin");
      }

      const data = await response.json();
      
      // Refresh the admin users list
      fetchUsers();
      return data;
    } catch (error) {
      console.error("Error creating organization admin:", error);
      throw error;
    }
  };

  const value = {
    users,
    fetchUsers,
    sendInviteEmail,
    deleteUser,
    createOrganizationAdmin,
    organizations,
    loadOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    loadOrganizationAdmins,
    organizationAdmins,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
};
