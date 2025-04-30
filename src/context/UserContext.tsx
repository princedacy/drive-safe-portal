
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, UserRole } from "./AuthContext";

// Extended user type with admin properties
interface ExtendedUser extends Omit<User, "phone"> {
  address?: string;
  type?: string;
  phone?: string;
}

interface UserContextType {
  users: ExtendedUser[];
  addUser: (user: Omit<ExtendedUser, "id">) => void;
  updateUser: (user: ExtendedUser) => void;
  deleteUser: (userId: string) => void;
  sendInviteEmail: (email: string, role: UserRole) => Promise<void>;
}

// Sample users
const MOCK_USERS: ExtendedUser[] = [
  {
    id: "1",
    email: "superadmin@example.com",
    firstName: "Super",
    lastName: "Admin",
    role: "SUPER_ADMIN",
    phone: "1234567890",
  },
  {
    id: "2",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    address: "New York, USA",
    type: "TESTING_CENTER",
    phone: "1234567890",
  },
  {
    id: "3",
    email: "user1@example.com",
    firstName: "Test",
    lastName: "User 1",
    role: "USER",
    phone: "1234567890",
    assignedExams: ["exam1", "exam2"],
  },
  {
    id: "4",
    email: "user2@example.com",
    firstName: "Test",
    lastName: "User 2",
    role: "USER",
    phone: "1234567890",
    assignedExams: ["exam2"],
  },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<ExtendedUser[]>([]);

  useEffect(() => {
    // Load mock users
    setUsers(MOCK_USERS);
  }, []);

  const addUser = (userData: Omit<ExtendedUser, "id">) => {
    const newUser: ExtendedUser = {
      ...userData,
      id: `user${Date.now()}`,
    };
    
    setUsers((prevUsers) => [...prevUsers, newUser]);
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
        addUser,
        updateUser,
        deleteUser,
        sendInviteEmail,
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
