
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useUsers } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Save, Trash2, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define schema for admin creation form
const adminFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  type: z.string().min(2, { message: "Type must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Phone must be at least 10 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export default function AdminManagement() {
  const { admins, createAdmin, deleteUser, loadAdmins, isLoading } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Load admins on component mount
  useEffect(() => {
    loadAdmins();
  }, []);
  
  // Setup form with react-hook-form and zod validation
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "TESTING_CENTER", // Default value
      phone: "",
      email: "",
    },
  });
  
  // Filter admin users based on search query
  const filteredAdmins = admins.filter((admin) => 
    (admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     admin.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleCreateAdmin = async (data: AdminFormValues) => {
    setIsSubmitting(true);
    try {
      await createAdmin({
        name: data.name,
        email: data.email,
        address: data.address,
        type: data.type,
        phone: data.phone,
      });
      
      toast({
        title: "Admin created",
        description: `${data.name} has been added as an admin.`,
      });
      
      form.reset();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: "Failed to create admin",
        description: "There was an error creating the admin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteAdmin = (userId: string, userName: string | undefined) => {
    deleteUser(userId);
    
    toast({
      title: "Admin deleted",
      description: `${userName || "Admin"} has been removed from the admin list.`,
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
                Create Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new admin account.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateAdmin)} className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter organization name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter organization type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Create Admin
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
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
              
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredAdmins.length > 0 ? (
                <div>
                  {filteredAdmins.map((admin) => (
                    <div key={admin.id} className="flex items-center p-4 border-t">
                      <div className="flex-1 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-secondary" />
                        <span>{admin.name || "Unnamed Admin"}</span>
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
