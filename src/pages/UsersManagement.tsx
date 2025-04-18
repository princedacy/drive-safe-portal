
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useUsers } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Mail, Trash2, UserCog } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function UsersManagement() {
  const { users, sendInviteEmail, deleteUser } = useUsers();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");
  const [isInviting, setIsInviting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const isSuperAdmin = currentUser?.role === "superadmin";
  
  // Filter users based on role and search
  const filteredUsers = users.filter((user) => {
    // Superadmins can see everyone, admins only see users
    if (!isSuperAdmin && user.role !== "user") {
      return false;
    }
    
    // Filter by search query
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSearch;
  });
  
  const handleInviteUser = async () => {
    if (!newUserEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsInviting(true);
    
    try {
      await sendInviteEmail(newUserEmail, newUserRole);
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${newUserEmail}.`,
      });
      
      setNewUserEmail("");
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error sending invitation",
        description: "There was an error sending the invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };
  
  const handleDeleteUser = (userId: string, userName: string) => {
    deleteUser(userId);
    
    toast({
      title: "User deleted",
      description: `${userName} has been removed from the system.`,
    });
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {isSuperAdmin ? "Users Management" : "Manage Users"}
          </h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation email to add a new user to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUserRole} 
                    onValueChange={(value: "admin" | "user") => setNewUserRole(value)}
                    disabled={!isSuperAdmin}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {isSuperAdmin && (
                        <SelectItem value="admin">Admin</SelectItem>
                      )}
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  {!isSuperAdmin && (
                    <p className="text-xs text-muted-foreground">
                      Only super admins can create admin users.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleInviteUser} 
                  disabled={isInviting}
                >
                  {isInviting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search users by name, email, or role..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="rounded-md border">
          <div className="flex items-center p-4 bg-muted">
            <div className="flex-1 font-medium">Name</div>
            <div className="flex-1 font-medium">Email</div>
            <div className="w-24 font-medium">Role</div>
            <div className="w-24 text-right font-medium">Actions</div>
          </div>
          
          {filteredUsers.length > 0 ? (
            <div>
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center p-4 border-t">
                  <div className="flex-1 truncate">{user.name}</div>
                  <div className="flex-1 truncate">{user.email}</div>
                  <div className="w-24">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      user.role === "superadmin" 
                        ? "bg-accent text-accent-foreground" 
                        : user.role === "admin"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="w-24 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={user.id === currentUser?.id || user.role === "superadmin"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No users match your search criteria"
                  : "No users found"}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
