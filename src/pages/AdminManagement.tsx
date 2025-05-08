
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useUsers } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Save, Trash2, Shield, Edit, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define schema for organization creation form
const organizationFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  type: z.string().min(2, { message: "Type must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Phone must be at least 10 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
});

// Define schema for organization admin creation form
const orgAdminFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  type: z.string().min(2, { message: "Type must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Phone must be at least 10 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;
type OrgAdminFormValues = z.infer<typeof orgAdminFormSchema>;

export default function AdminManagement() {
  const { admins, createAdmin, deleteUser, loadAdmins, isLoading, updateAdmin, createOrganizationAdmin, loadOrganizationAdmins, organizationAdmins } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [orgAdminDialogOpen, setOrgAdminDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [viewingOrgAdmins, setViewingOrgAdmins] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);
  const { toast } = useToast();
  
  // Load admins on component mount
  useEffect(() => {
    loadAdmins();
  }, []);
  
  // Setup form with react-hook-form and zod validation
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "TESTING_CENTER", // Default value
      phone: "",
      email: "",
    },
  });

  // Setup edit form
  const editForm = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "",
      phone: "",
      email: "",
    },
  });

  // Setup organization admin form
  const orgAdminForm = useForm<OrgAdminFormValues>({
    resolver: zodResolver(orgAdminFormSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "TESTING_CENTER", // Default value
      phone: "",
      email: "",
      password: "",
    },
  });
  
  // Filter admin users based on search query
  const filteredAdmins = viewingOrgAdmins
    ? organizationAdmins.filter((admin) => 
        (admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         admin.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : admins.filter((admin) => 
        (admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         admin.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  const handleCreateOrganization = async (data: OrganizationFormValues) => {
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
        title: "Organization created",
        description: `${data.name} has been added as an organization.`,
      });
      
      form.reset();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Failed to create organization",
        description: "There was an error creating the organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOrgAdmin = async (data: OrgAdminFormValues) => {
    if (!selectedOrgId) {
      toast({
        title: "No organization selected",
        description: "Please select an organization first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrganizationAdmin(selectedOrgId, {
        name: data.name,
        email: data.email,
        address: data.address,
        type: data.type,
        phone: data.phone,
        password: data.password,
      });
      
      toast({
        title: "Organization Admin created",
        description: `${data.name} has been added as an organization admin.`,
      });
      
      orgAdminForm.reset();
      setOrgAdminDialogOpen(false);
      
      // Refresh the organization admins list if we're currently viewing them
      if (viewingOrgAdmins && selectedOrgId) {
        await loadOrganizationAdmins(selectedOrgId);
      }
    } catch (error) {
      console.error('Error creating organization admin:', error);
      toast({
        title: "Failed to create organization admin",
        description: "There was an error creating the organization admin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (admin: any) => {
    setCurrentAdminId(admin.id);
    editForm.reset({
      name: admin.name || "",
      email: admin.email || "",
      address: admin.address || "",
      type: admin.type || "",
      phone: admin.phone || "",
    });
    setEditDialogOpen(true);
  };

  const openOrgAdminDialog = (orgId: string) => {
    setSelectedOrgId(orgId);
    orgAdminForm.reset();
    setOrgAdminDialogOpen(true);
  };
  
  const handleUpdateAdmin = async (data: OrganizationFormValues) => {
    if (!currentAdminId) return;
    
    setIsSubmitting(true);
    try {
      await updateAdmin(currentAdminId, {
        name: data.name,
        email: data.email,
        address: data.address,
        type: data.type,
        phone: data.phone,
      });
      
      toast({
        title: "Organization updated",
        description: `${data.name} has been updated successfully.`,
      });
      
      editForm.reset();
      setEditDialogOpen(false);
      setCurrentAdminId(null);
    } catch (error) {
      console.error('Error updating admin:', error);
      toast({
        title: "Failed to update organization",
        description: "There was an error updating the organization. Please try again.",
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
      description: `${userName || "Admin"} has been removed.`,
    });
  };

  const viewOrganizationAdmins = async (organization: any) => {
    setCurrentOrganization(organization);
    setViewingOrgAdmins(true);
    setSearchQuery("");
    await loadOrganizationAdmins(organization.id);
  };
  
  const goBackToOrganizations = () => {
    setViewingOrgAdmins(false);
    setCurrentOrganization(null);
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          {viewingOrgAdmins ? (
            <>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  onClick={goBackToOrganizations}
                  className="mr-2"
                >
                  Back to Organizations
                </Button>
                <h1 className="text-3xl font-bold">
                  {currentOrganization?.name || "Organization"} Admins
                </h1>
              </div>
              <Button onClick={() => openOrgAdminDialog(currentOrganization.id)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">Admin Management</h1>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Shield className="mr-2 h-4 w-4" />
                    Create Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new organization.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateOrganization)} className="space-y-4 py-2">
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
                          Create Organization
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
        
        {/* Edit Admin Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Organization</DialogTitle>
              <DialogDescription>
                Edit the details of this organization.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdateAdmin)} className="space-y-4 py-2">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                    Update Organization
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Create Organization Admin Dialog */}
        <Dialog open={orgAdminDialogOpen} onOpenChange={setOrgAdminDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Organization Admin</DialogTitle>
              <DialogDescription>
                Create an admin user for this organization
              </DialogDescription>
            </DialogHeader>
            <Form {...orgAdminForm}>
              <form onSubmit={orgAdminForm.handleSubmit(handleCreateOrgAdmin)} className="space-y-4 py-2">
                <FormField
                  control={orgAdminForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter admin name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orgAdminForm.control}
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
                  control={orgAdminForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter admin type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orgAdminForm.control}
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
                  control={orgAdminForm.control}
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

                <FormField
                  control={orgAdminForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter password" type="password" {...field} />
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
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder={viewingOrgAdmins ? "Search organization admins..." : "Search organizations..."} 
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
                <div className="flex-1 font-medium">
                  {viewingOrgAdmins ? "Admin Name" : "Organization Name"}
                </div>
                <div className="flex-1 font-medium">Email</div>
                <div className="w-40 text-right font-medium">Actions</div>
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
                        <span>{admin.name || "Unnamed"}</span>
                      </div>
                      <div className="flex-1">{admin.email}</div>
                      <div className="w-40 text-right flex justify-end">
                        {!viewingOrgAdmins && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10 hover:text-primary mr-1"
                            onClick={() => viewOrganizationAdmins(admin)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        )}
                        {viewingOrgAdmins && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10 hover:text-primary mr-1"
                            onClick={() => openEditDialog(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {!viewingOrgAdmins && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10 hover:text-primary mr-1"
                            onClick={() => openEditDialog(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
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
                      ? "No results match your search criteria"
                      : viewingOrgAdmins ? "No organization admins found" : "No organizations found"}
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
