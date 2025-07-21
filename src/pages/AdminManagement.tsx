import { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatDisplayText, formatUserRole } from "@/lib/format-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/config";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Plus, Eye, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ADMIN_ROLE } from "@/types/UserRole";

// Define the types for the data
export interface User {
  id?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface Organization {
  id?: string;
  _id?: string;
  name: string;
  address: string;
  type: string;
  phone: string;
  email: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  count: number;
  limit: number;
  page: number;
  pages: number;
}

const organizationSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  type: z.enum(["INSTITUTION", "EMPLOYER", "TESTING_CENTER"], {
    message: "Please select an organization type.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
});

const updateOrganizationSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  type: z.enum(["INSTITUTION", "EMPLOYER", "TESTING_CENTER"], {
    message: "Please select an organization type.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
});

const adminSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  organizationId: z.string().min(1, {
    message: "Please select an organization.",
  }),
});

export default function AdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  // Admin pagination state
  const [adminCurrentPage, setAdminCurrentPage] = useState(0);
  const [adminLimit] = useState(10);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  // Dialog states
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const [isUpdateOrgDialogOpen, setIsUpdateOrgDialogOpen] = useState(false);
  const { token, currentUser } = useAuth();
  
  // Check if user is super admin or organization admin
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isOrgAdmin = currentUser?.role === 'ORGANIZATION_ADMIN';

  // Fetch organizations with pagination using correct endpoint
  const { data: organizationsData, isLoading: isOrganizationsLoading, error: organizationsError } = useQuery({
    queryKey: ['organizations', currentPage, limit],
    queryFn: async () => {
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      console.log('Fetching organizations...');
      // Use different endpoint based on user role
      const endpoint = isSuperAdmin 
        ? `${API_URL}/super/organizations?page=${currentPage}&limit=${limit}`
        : `${API_URL}/organizations`; // Organization admin sees only their org
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log('Organizations response:', response.data);
      
      // Handle different response formats
      if (isOrgAdmin && !response.data.data) {
        // If org admin gets direct organization data, wrap it in pagination format
        return {
          data: Array.isArray(response.data) ? response.data : [response.data],
          total: 1,
          count: 1, 
          limit: 10,
          page: 0,
          pages: 1
        } as PaginatedResponse<Organization>;
      }
      
      return response.data as PaginatedResponse<Organization>;
    },
    enabled: !!token,
  });

  // Fetch single organization when selected
  const { data: singleOrgData } = useQuery({
    queryKey: ['single-organization', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId || !token) return null;
      
      console.log('Fetching single organization:', selectedOrganizationId);
      // Use different endpoint based on user role
      const endpoint = isSuperAdmin 
        ? `${API_URL}/super/organizations/${selectedOrganizationId}`
        : `${API_URL}/organizations/${selectedOrganizationId}`;
        
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log('Single organization response:', response.data);
      return response.data as Organization;
    },
    enabled: !!selectedOrganizationId && !!token,
  });

  useEffect(() => {
    if (singleOrgData) {
      setSelectedOrganization(singleOrgData);
    }
  }, [singleOrgData]);

  useEffect(() => {
    if (organizationsData && organizationsData.pages) {
      setTotalPages(organizationsData.pages);
    }
  }, [organizationsData]);

  // Fetch admins with updated endpoint and pagination
  const { data: adminsResponse, isLoading: isAdminLoading, error: adminError, refetch: refetchAdmins } = useQuery({
    queryKey: ['admins', selectedOrganizationId, adminCurrentPage, adminLimit],
    queryFn: async () => {
      if (!selectedOrganizationId || !token) return { data: [], total: 0, count: 0, limit: 10, page: 0, pages: 0 };
      
      console.log('Fetching admins for organization:', selectedOrganizationId, 'page:', adminCurrentPage);
      // Use different endpoint based on user role
      const endpoint = isSuperAdmin 
        ? `${API_URL}/super/organizations/${selectedOrganizationId}/users?page=${adminCurrentPage}&limit=${adminLimit}`
        : `${API_URL}/admin/organizations/${selectedOrganizationId}/users?page=${adminCurrentPage}&limit=${adminLimit}`;
        
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      console.log('Admins response:', response.data);
      return response.data as PaginatedResponse<User>;
    },
    enabled: !!selectedOrganizationId && !!token,
  });

  const admins = adminsResponse?.data || [];
  
  useEffect(() => {
    if (adminsResponse?.pages) {
      setAdminTotalPages(adminsResponse.pages);
    }
  }, [adminsResponse]);

  // Organization form
  const organizationForm = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "TESTING_CENTER",
      phone: "",
      email: "",
    },
  });

  // Update organization form
  const updateOrganizationForm = useForm<z.infer<typeof updateOrganizationSchema>>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "TESTING_CENTER",
      phone: "",
      email: "",
    },
  });

  // Admin form
  const adminForm = useForm<z.infer<typeof adminSchema>>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      organizationId: "",
    },
  });

  // Create organization mutation with correct schema - only for super admins
  const createOrganizationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof organizationSchema>) => {
      if (!token || !isSuperAdmin) {
        throw new Error("No authentication token found or insufficient permissions");
      }
      
      return axios.post(`${API_URL}/super/organizations/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['organizations']});
      organizationForm.reset();
      setIsCreateOrgDialogOpen(false);
      toast({
        title: "Organization created successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Error creating organization:", error);
      toast({
        title: "Failed to create organization.",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  // Update organization mutation - only for super admins
  const updateOrganizationMutation = useMutation({
    mutationFn: async ({ organizationId, data }: { organizationId: string; data: z.infer<typeof updateOrganizationSchema> }) => {
      if (!token || !isSuperAdmin) {
        throw new Error("No authentication token found or insufficient permissions");
      }
      
      return axios.put(`${API_URL}/super/organizations/${organizationId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['organizations']});
      queryClient.invalidateQueries({queryKey: ['single-organization']});
      updateOrganizationForm.reset();
      setIsUpdateOrgDialogOpen(false);
      toast({
        title: "Organization updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Error updating organization:", error);
      toast({
        title: "Failed to update organization.",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  // Create admin mutation - fix the endpoint and data structure
  const createAdminMutation = useMutation({
    mutationFn: async (data: z.infer<typeof adminSchema>) => {
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const adminData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password
      };
      
      console.log('Creating admin with data:', adminData);
      console.log('Organization ID:', data.organizationId);
      
      // Use different endpoint based on user role
      const endpoint = isSuperAdmin 
        ? `${API_URL}/super/organizations/${data.organizationId}/users`
        : `${API_URL}/admin/organizations/${data.organizationId}/users?page=0&limit=10`;
      
      return axios.post(endpoint, adminData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({queryKey: ['admins', variables.organizationId]});
      adminForm.reset();
      toast({
        title: "Admin created successfully!",
      });
      // Refetch admins to immediately show the new admin
      refetchAdmins();
    },
    onError: (error: any) => {
      console.error("Error creating admin:", error);
      toast({
        title: "Failed to create admin.",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const createOrganization = async (data: z.infer<typeof organizationSchema>) => {
    try {
      createOrganizationMutation.mutate(data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateOrganization = async (data: z.infer<typeof updateOrganizationSchema>) => {
    if (!selectedOrganizationId) return;
    try {
      updateOrganizationMutation.mutate({ organizationId: selectedOrganizationId, data });
    } catch (error) {
      console.error(error);
    }
  };

  const createAdmin = async (data: z.infer<typeof adminSchema>) => {
    try {
      createAdminMutation.mutate(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectOrganization = (organizationId: string) => {
    console.log('Selecting organization:', organizationId);
    setSelectedOrganizationId(organizationId);
    setAdminCurrentPage(0); // Reset admin pagination when selecting new organization
    adminForm.setValue('organizationId', organizationId);
    console.log('Set organizationId in form:', organizationId);
  };

  const handleAdminPageChange = (page: number) => {
    setAdminCurrentPage(page);
  };

  const handleEditOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    const orgId = organization.id || organization._id;
    setSelectedOrganizationId(orgId);
    // Pre-fill the update form with current organization data
    updateOrganizationForm.reset({
      name: organization.name,
      address: organization.address,
      type: organization.type as "INSTITUTION" | "EMPLOYER" | "TESTING_CENTER",
      phone: organization.phone,
      email: organization.email,
    });
    setIsUpdateOrgDialogOpen(true);
  };

  // Helper function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Generate pagination items for organizations
  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    
    if (!totalPages || totalPages <= 0) {
      return items;
    }
    
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => handlePageChange(i)}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  // Generate pagination items for admins
  const renderAdminPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    
    if (!adminTotalPages || adminTotalPages <= 0) {
      return items;
    }
    
    let startPage = Math.max(0, adminCurrentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(adminTotalPages - 1, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={adminCurrentPage === i} 
            onClick={() => handleAdminPageChange(i)}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  if (organizationsError) {
    console.error("Organizations error:", organizationsError);
  }

  const actualTotalPages = organizationsData?.pages || 1;

  // Auto-select organization for org admins
  useEffect(() => {
    if (isOrgAdmin) {
      // Extract organization from JWT token for org admins
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.organization && payload.organization._id) {
            const orgId = payload.organization._id;
            setSelectedOrganizationId(orgId);
            setSelectedOrganization(payload.organization);
            adminForm.setValue('organizationId', orgId);
            console.log('Set organization from token:', orgId);
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
    } else if (organizationsData?.data && organizationsData.data.length > 0) {
      const firstOrg = organizationsData.data[0];
      const orgId = firstOrg.id || firstOrg._id;
      if (orgId) {
        setSelectedOrganizationId(orgId);
        adminForm.setValue('organizationId', orgId);
      }
    }
  }, [isOrgAdmin, organizationsData, adminForm]);

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">
          {isSuperAdmin ? 'Admin & Organization Management' : 'Admin Management'}
        </h1>

        <div className={`grid grid-cols-1 ${isSuperAdmin ? 'md:grid-cols-2' : ''} gap-6`}>
          {/* Organizations Section - Only show for super admins */}
          {isSuperAdmin && (
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Organizations</CardTitle>
                <CardDescription>Manage organizations and their details.</CardDescription>
              </div>
              <Dialog open={isCreateOrgDialogOpen} onOpenChange={setIsCreateOrgDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Organization</DialogTitle>
                    <DialogDescription>
                      Add a new organization to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...organizationForm}>
                    <form onSubmit={organizationForm.handleSubmit(createOrganization)} className="space-y-4">
                      <FormField
                        control={organizationForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Organization Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={organizationForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Organization Address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={organizationForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select organization type" />
                                </SelectTrigger>
                              </FormControl>
                               <SelectContent>
                                 <SelectItem value="TESTING_CENTER">Testing Center</SelectItem>
                                 <SelectItem value="INSTITUTION">Institution</SelectItem>
                                 <SelectItem value="EMPLOYER">Employer</SelectItem>
                               </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={organizationForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={organizationForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Email Address" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <Button type="submit" disabled={createOrganizationMutation.isPending} className="w-full">
                         {createOrganizationMutation.isPending ? "Creating..." : "Create Organization"}
                       </Button>
                     </form>
                   </Form>
                 </DialogContent>
               </Dialog>
            </CardHeader>
            <CardContent>
              {isOrganizationsLoading ? (
                <p>Loading organizations...</p>
              ) : organizationsError ? (
                <p className="text-red-500">Error: {(organizationsError as Error).message}</p>
              ) : (
                <div className="space-y-4">
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>Name</TableHead>
                         <TableHead>Address</TableHead>
                         <TableHead>Type</TableHead>
                         <TableHead className="w-[200px]">Actions</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {organizationsData?.data && organizationsData.data.length > 0 ? (
                         organizationsData.data.map((organization) => {
                           const orgId = organization.id || organization._id;
                           return (
                             <TableRow key={orgId}>
                               <TableCell>{organization.name}</TableCell>
                               <TableCell>{organization.address}</TableCell>
                               <TableCell>{formatDisplayText(organization.type)}</TableCell>
                               <TableCell>
                                 <div className="flex items-center gap-2">
                                   <Button 
                                     variant="outline" 
                                     size="sm"
                                     onClick={() => handleSelectOrganization(orgId)}
                                     className={selectedOrganizationId === orgId ? "bg-primary text-primary-foreground" : ""}
                                   >
                                     <Eye className="h-4 w-4 mr-1" />
                                     View
                                   </Button>
                                   <Button 
                                     variant="ghost" 
                                     size="sm"
                                     onClick={() => handleEditOrganization(organization)}
                                     className="hover:bg-muted"
                                   >
                                     <Edit className="h-4 w-4" />
                                   </Button>
                                 </div>
                               </TableCell>
                             </TableRow>
                           );
                         })
                       ) : (
                         <TableRow>
                           <TableCell colSpan={4} className="text-center">No organizations found</TableCell>
                         </TableRow>
                       )}
                     </TableBody>
                  </Table>

                  {actualTotalPages > 1 && (
                    <Pagination className="mt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                            aria-disabled={currentPage === 0}
                            className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {renderPaginationItems()}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(Math.min(actualTotalPages - 1, currentPage + 1))}
                            aria-disabled={currentPage === actualTotalPages - 1}
                            className={currentPage === actualTotalPages - 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}

                   {/* Update Organization Dialog */}
                   <Dialog open={isUpdateOrgDialogOpen} onOpenChange={setIsUpdateOrgDialogOpen}>
                     <DialogContent className="sm:max-w-[425px]">
                       <DialogHeader>
                         <DialogTitle>Update Organization</DialogTitle>
                         <DialogDescription>
                           Update details for {selectedOrganization?.name}.
                         </DialogDescription>
                       </DialogHeader>
                       <Form {...updateOrganizationForm}>
                         <form onSubmit={updateOrganizationForm.handleSubmit(updateOrganization)} className="space-y-4">
                           <FormField
                             control={updateOrganizationForm.control}
                             name="name"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Organization Name</FormLabel>
                                 <FormControl>
                                   <Input placeholder={selectedOrganization?.name} {...field} />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={updateOrganizationForm.control}
                             name="address"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Address</FormLabel>
                                 <FormControl>
                                   <Input placeholder={selectedOrganization?.address} {...field} />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={updateOrganizationForm.control}
                             name="type"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Organization Type</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                   <FormControl>
                                     <SelectTrigger>
                                       <SelectValue placeholder="Select organization type" />
                                     </SelectTrigger>
                                   </FormControl>
                                   <SelectContent>
                                     <SelectItem value="TESTING_CENTER">Testing Center</SelectItem>
                                     <SelectItem value="INSTITUTION">Institution</SelectItem>
                                     <SelectItem value="EMPLOYER">Employer</SelectItem>
                                   </SelectContent>
                                 </Select>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={updateOrganizationForm.control}
                             name="phone"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Phone</FormLabel>
                                 <FormControl>
                                   <Input placeholder={selectedOrganization?.phone} {...field} />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={updateOrganizationForm.control}
                             name="email"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Email</FormLabel>
                                 <FormControl>
                                   <Input placeholder={selectedOrganization?.email} type="email" {...field} />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           <Button type="submit" disabled={updateOrganizationMutation.isPending} className="w-full">
                             {updateOrganizationMutation.isPending ? "Updating..." : "Update Organization"}
                           </Button>
                         </form>
                       </Form>
                     </DialogContent>
                   </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Admins Section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Admins</CardTitle>
              <CardDescription>
                {selectedOrganization 
                  ? `Manage admins for ${selectedOrganization.name}` 
                  : isOrgAdmin 
                    ? "Manage admins for your organization."
                    : "Select an organization to view and manage admins."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedOrganizationId || isOrgAdmin ? (
                <div className="space-y-4">
                  {/* Create Admin Button - Always show when organization is selected or for org admins */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Admin
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create Admin</DialogTitle>
                        <DialogDescription>
                          Add a new admin to {selectedOrganization?.name || "your organization"}.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...adminForm}>
                        <form onSubmit={adminForm.handleSubmit(createAdmin)} className="space-y-4">
                          <FormField
                            control={adminForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="First Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={adminForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Last Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={adminForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Email" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={adminForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Phone" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={adminForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input placeholder="Password" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <input type="hidden" {...adminForm.register('organizationId')} />
                          <Button type="submit" disabled={createAdminMutation.isPending}>
                            {createAdminMutation.isPending ? "Creating..." : "Create Admin"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  {/* Admins Table */}
                  {isAdminLoading ? (
                    <p>Loading admins...</p>
                  ) : adminError ? (
                    <p className="text-red-500">Error: {(adminError as Error).message}</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Admin</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins && admins.length > 0 ? (
                          admins.map((admin) => (
                            <TableRow key={admin.id || admin._id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarFallback>
                                      {getInitials(admin.firstName, admin.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{admin.firstName} {admin.lastName}</span>
                                </div>
                              </TableCell>
                              <TableCell>{admin.email}</TableCell>
                              <TableCell>{admin.phone}</TableCell>
                              <TableCell>{formatUserRole(admin.role)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">No admins found for this organization</TableCell>
                          </TableRow>
                        )}
                       </TableBody>
                     </Table>
                   )}

                   {/* Admin Pagination */}
                   {adminTotalPages > 1 && (
                     <Pagination className="mt-4">
                       <PaginationContent>
                         <PaginationItem>
                           <PaginationPrevious 
                             onClick={() => handleAdminPageChange(Math.max(0, adminCurrentPage - 1))}
                             aria-disabled={adminCurrentPage === 0}
                             className={adminCurrentPage === 0 ? "pointer-events-none opacity-50" : ""}
                           />
                         </PaginationItem>
                         
                         {renderAdminPaginationItems()}
                         
                         <PaginationItem>
                           <PaginationNext 
                             onClick={() => handleAdminPageChange(Math.min(adminTotalPages - 1, adminCurrentPage + 1))}
                             aria-disabled={adminCurrentPage === adminTotalPages - 1}
                             className={adminCurrentPage === adminTotalPages - 1 ? "pointer-events-none opacity-50" : ""}
                           />
                         </PaginationItem>
                       </PaginationContent>
                     </Pagination>
                   )}
                 </div>
               ) : (
                 <p className="text-center text-muted-foreground py-8">Select an organization to view and manage admins.</p>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
