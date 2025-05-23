
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
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/config";
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
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from "@/types/UserRole";

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
  location: string;
}

const organizationSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
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

  // Fetch organizations
  const { data: organizations, isLoading: isOrganizationsLoading, error: organizationsError } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/organizations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data as Organization[];
    },
  });

  // Fetch admins
  const { data: admins, isLoading: isAdminLoading, error: adminError } = useQuery({
    queryKey: ['admins', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return [];
      const response = await axios.get(`${API_URL}/organizations/${selectedOrganizationId}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data as User[];
    },
    enabled: !!selectedOrganizationId,
  });

  // Organization form
  const organizationForm = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      location: "",
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

  // Create organization mutation
  const createOrganizationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof organizationSchema>) => {
      return axios.post(`${API_URL}/organizations`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
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
      toast({
        title: "Failed to create organization.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: z.infer<typeof adminSchema>) => {
      return axios.post(`${API_URL}/super/organizations/${data.organizationId}/users`, 
        { ...data, role: ADMIN_ROLE }, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
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
      toast({
        title: "Failed to create admin.",
        description: error.message,
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

  useEffect(() => {
    // Set the organizationId in the admin form when an organization is selected
    if (selectedOrganizationId) {
      adminForm.setValue('organizationId', selectedOrganizationId);
    }
  }, [selectedOrganizationId, adminForm]);

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
                        <TableHead>Location</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizations?.map((organization) => (
                        <TableRow key={organization.id}>
                          <TableCell>{organization.name}</TableCell>
                          <TableCell>{organization.location}</TableCell>
                          <TableCell>
                            <Button variant="outline" onClick={() => setSelectedOrganizationId(organization.id)}>
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

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
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="Organization Location" {...field} />
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
              <CardDescription>Manage admins within the selected organization.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedOrganizationId ? (
                isAdminLoading ? (
                  <p>Loading admins...</p>
                ) : adminError ? (
                  <p className="text-red-500">Error: {(adminError as Error).message}</p>
                ) : (
                  <div className="space-y-4">
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
                        {admins?.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>{admin.phone}</TableCell>
                            <TableCell>{admin.role}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Create Admin</DialogTitle>
                          <DialogDescription>
                            Add a new admin to the selected organization.
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
                            <Button type="submit">Create Admin</Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                )
              ) : (
                <p>Select an organization to view and manage admins.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
