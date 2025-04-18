
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useUsers } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Mail, Trash2, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function AdminManagement() {
  const { users, sendInviteEmail, deleteUser } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Filter only admin users
  const adminUsers = users.filter((user) => 
    user.role === "admin" && 
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleInviteAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsInviting(true);
    
    try {
      await sendInviteEmail(newAdminEmail, "admin");
      
      toast({
        title: "Admin invitation sent",
        description: `An invitation has been sent to ${newAdminEmail}.`,
      });
      
      setNewAdminEmail("");
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
  
  const handleDeleteAdmin = (userId: string, userName: string) => {
    deleteUser(userId);
    
    toast({
      title: "Admin deleted",
      description: `${userName} has been removed from the admin list.`,
    });
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Admin</DialogTitle>
                <DialogDescription>
                  Send an invitation email to add a new administrator to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleInviteAdmin} 
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
              placeholder="Search admins by name or email..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md overflow-hidden">
              <div className="flex items-center p-4 bg-muted">
                <div className="flex-1 font-medium">Admin Name</div>
                <div className="flex-1 font-medium">Email</div>
                <div className="w-24 text-right font-medium">Actions</div>
              </div>
              
              {adminUsers.length > 0 ? (
                <div>
                  {adminUsers.map((admin) => (
                    <div key={admin.id} className="flex items-center p-4 border-t">
                      <div className="flex-1 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-secondary" />
                        <span>{admin.name}</span>
                      </div>
                      <div className="flex-1">{admin.email}</div>
                      <div className="w-24 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteAdmin(admin.id, admin.name)}
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
                      ? "No admins match your search criteria"
                      : "No admin users found"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
