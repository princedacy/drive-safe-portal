import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { API_URL } from "@/config";
import { UserRole } from "@/types/UserRole";

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const { userToken } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
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

  useEffect(() => {
    if (userToken) {
      fetchUsers();
    }
  }, [userToken]);

  const sendInviteEmail = async (email: string, role: UserRole) => {
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
