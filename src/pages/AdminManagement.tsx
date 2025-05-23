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
import { useToast } from "@/hooks/use-toast";
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
import { Plus, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ADMIN_ROLE } from "@/types/UserRole";

// Define the types for the data
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  type: string;
  phone: string;
  email: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const organizationSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  type: z.enum(["TESTING_CENTER", "SCHOOL", "COMPANY"], {
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
  organizationId: z.string().uuid({
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
  const { token } = useAuth();

  // Fetch organizations with pagination using correct endpoint
  const { data: organizationsData, isLoading: isOrganizationsLoading, error: organizationsError } = useQuery({
    queryKey: ['organizations', currentPage, limit],
    queryFn: async () => {
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await axios.get(`${API_URL}/super/organizations?page=${currentPage}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      return response.data as PaginatedResponse<Organization>;
    },
    enabled: !!token,
  });

  // Fetch single organization when selected
  const { data: singleOrgData } = useQuery({
    queryKey: ['single-organization', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId || !token) return null;
      
      const response = await axios.get(`${API_URL}/super/organizations/${selectedOrganizationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
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
    if (organizationsData && organizationsData.meta) {
      setTotalPages(organizationsData.meta.totalPages);
    }
  }, [organizationsData]);

  // Fetch admins with updated endpoint - fix the response handling
  const { data: adminsResponse, isLoading: isAdminLoading, error: adminError } = useQuery({
    queryKey: ['admins', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId || !token) return { data: [] };
      
      const response = await axios.get(`${API_URL}/super/organizations/${selectedOrganizationId}/users?page=0&limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // Handle both array response and paginated response
      if (Array.isArray(response.data)) {
        return { data: response.data };
      } else {
        return response.data;
      }
    },
    enabled: !!selectedOrganizationId && !!token,
  });

  const admins = adminsResponse?.data || [];

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

  // Create organization mutation with correct schema
  const createOrganizationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof organizationSchema>) => {
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      return axios.post(`${API_URL}/super/organizations`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['organizations']});
      organizationForm.reset();
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

  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: z.infer<typeof adminSchema>) => {
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      return axios.post(`${API_URL}/super/organizations/${data.organizationId}/users`, 
        { ...data, role: ADMIN_ROLE }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({queryKey: ['admins', variables.organizationId]});
      adminForm.reset();
      toast({
        title: "Admin created successfully!",
      });
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
    setSelectedOrganizationId(organizationId);
    adminForm.setValue('organizationId', organizationId);
  };

  // Generate pagination items
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

  if (organizationsError) {
    console.error("Organizations error:", organizationsError);
  }

  const actualTotalPages = organizationsData?.meta?.totalPages || 1;

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Admin & Organization Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organizations Section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Manage organizations and their details.</CardDescription>
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
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizationsData?.data && organizationsData.data.length > 0 ? (
                        organizationsData.data.map((organization) => (
                          <TableRow key={organization.id}>
                            <TableCell>{organization.name}</TableCell>
                            <TableCell>{organization.address}</TableCell>
                            <TableCell>{organization.type}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                onClick={() => handleSelectOrganization(organization.id)}
                                className={selectedOrganizationId === organization.id ? "bg-primary text-primary-foreground" : ""}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
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

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
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
                                    <SelectItem value="SCHOOL">School</SelectItem>
                                    <SelectItem value="COMPANY">Company</SelectItem>
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
                          <Button type="submit">Create Organization</Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admins Section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Admins</CardTitle>
              <CardDescription>
                {selectedOrganization 
                  ? `Manage admins for ${selectedOrganization.name}` 
                  : "Select an organization to view and manage admins."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedOrganizationId ? (
                <div className="space-y-4">
                  {/* Create Admin Button - Always show when organization is selected */}
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
                          Add a new admin to {selectedOrganization?.name}.
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
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins && admins.length > 0 ? (
                          admins.map((admin) => (
                            <TableRow key={admin.id}>
                              <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                              <TableCell>{admin.email}</TableCell>
                              <TableCell>{admin.phone}</TableCell>
                              <TableCell>{admin.role}</TableCell>
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
