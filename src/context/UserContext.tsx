
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "./AuthContext";

interface UserContextType {
  users: User[];
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  sendInviteEmail: (email: string, role: User["role"]) => Promise<void>;
}

// Sample users
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
    email: "user1@example.com",
    name: "Test User 1",
    role: "user",
    assignedExams: ["exam1", "exam2"],
  },
  {
    id: "4",
    email: "user2@example.com",
    name: "Test User 2",
    role: "user",
    assignedExams: ["exam2"],
  },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load mock users
    setUsers(MOCK_USERS);
  }, []);

  const addUser = (userData: Omit<User, "id">) => {
    const newUser: User = {
      ...userData,
      id: `user${Date.now()}`,
    };
    
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  const sendInviteEmail = async (email: string, role: User["role"]) => {
    // In a real app, this would call an API to send an email with a magic link
    // For demo purposes, we'll simulate this with a timeout
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Email invitation sent to ${email} for role ${role}`);
    
    // Create a placeholder user
    const newUser: User = {
      id: `user${Date.now()}`,
      email,
      name: email.split('@')[0], // Default name from email
      role,
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
