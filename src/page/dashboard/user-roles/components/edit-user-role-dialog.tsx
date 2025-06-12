import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, User, Shield, Calendar, Clock, Edit3 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { permissionService } from '@/services/rbac.service';
import { useUpdateUserRole } from '@/hooks/api/use-rbac';
import { format } from 'date-fns';

const editUserRoleSchema = z.object({
  customPermissions: z.array(z.string()),
  deniedPermissions: z.array(z.string()),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

type EditUserRoleFormData = z.infer<typeof editUserRoleSchema>;

interface EditUserRoleDialogProps {
  userRole: any;
  user: any;
  role: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserRoleDialog({ 
  userRole, 
  user, 
  role, 
  open, 
  onOpenChange 
}: EditUserRoleDialogProps) {
  const { toast } = useToast();
  const updateUserRoleMutation = useUpdateUserRole();

  // Fetch all permissions for selection
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getAllPermissions(),
  });

  const permissions = permissionsData?.data || [];

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc: any, permission: any) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  const form = useForm<EditUserRoleFormData>({
    resolver: zodResolver(editUserRoleSchema),
    defaultValues: {
      customPermissions: userRole?.customPermissions || [],
      deniedPermissions: userRole?.deniedPermissions || [],
      expiresAt: userRole?.expiresAt ? format(new Date(userRole.expiresAt), "yyyy-MM-dd'T'HH:mm") : '',
      isActive: userRole?.isActive ?? true,
    },
  });

  // Update form when userRole changes
  useEffect(() => {
    if (userRole) {
      form.reset({
        customPermissions: userRole.customPermissions || [],
        deniedPermissions: userRole.deniedPermissions || [],
        expiresAt: userRole.expiresAt ? format(new Date(userRole.expiresAt), "yyyy-MM-dd'T'HH:mm") : '',
        isActive: userRole.isActive ?? true,
      });
    }
  }, [userRole, form]);

  const onSubmit = (data: EditUserRoleFormData) => {
    updateUserRoleMutation.mutate({
      id: userRole._id,
      data: {
        customPermissions: data.customPermissions.length > 0 ? data.customPermissions : undefined,
        deniedPermissions: data.deniedPermissions.length > 0 ? data.deniedPermissions : undefined,
        expiresAt: data.expiresAt || undefined,
        isActive: data.isActive,
      }
    }, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'User role assignment updated successfully',
        });
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update user role assignment',
        });
      },
    });
  };

  // Get role default permissions
  const rolePermissions = role?.permissions || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5" />
            <span>Edit User Role Assignment</span>
          </DialogTitle>
          <DialogDescription>
            Modify the role assignment for this user, including custom permissions and access controls.
          </DialogDescription>
        </DialogHeader>
        
        {/* User and Role Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <User className="h-4 w-4" />
                <span>User Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Shield className="h-4 w-4" />
                <span>Assigned Role</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{role?.code}</Badge>
                  <span className="font-medium">{role?.name}</span>
                </div>
                <div className="text-sm text-gray-500">{role?.description}</div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Level: {role?.level}</span>
                  <span>Permissions: {rolePermissions.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Details */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Calendar className="h-4 w-4" />
              <span>Assignment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-xs text-gray-500">Assigned On</Label>
              <div>{userRole?.assignedAt ? format(new Date(userRole.assignedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Assigned By</Label>
              <div>{userRole?.assignedBy || 'System'}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Status</Label>
              <div>
                <Badge variant={userRole?.isActive ? "default" : "secondary"}>
                  {userRole?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Status and Expiration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable this role assignment
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Expiration Date (Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty for permanent assignment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role Default Permissions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Role Default Permissions</CardTitle>
                <CardDescription>
                  These permissions are automatically granted by the {role?.name} role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {rolePermissions.map((permission: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                  {rolePermissions.length === 0 && (
                    <div className="text-sm text-gray-500">No default permissions</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Permissions */}
            <FormField
              control={form.control}
              name="customPermissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Additional Permissions</FormLabel>
                  <FormDescription>
                    Grant extra permissions beyond the role's default permissions
                  </FormDescription>
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                    {permissionsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading permissions...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedPermissions).map(([module, modulePermissions]: [string, any[]]) => (
                          <div key={module} className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">
                              {module}
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {modulePermissions.map((permission) => (
                                <div key={permission._id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={field.value.includes(permission.code)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...field.value, permission.code]);
                                      } else {
                                        field.onChange(field.value.filter((p: string) => p !== permission.code));
                                      }
                                    }}
                                    disabled={rolePermissions.includes(permission.code)}
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{permission.name}</div>
                                    <div className="text-xs text-gray-500">{permission.description}</div>
                                    <div className="flex items-center space-x-1 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {permission.code}
                                      </Badge>
                                      {rolePermissions.includes(permission.code) && (
                                        <Badge variant="secondary" className="text-xs">
                                          Role Default
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Denied Permissions */}
            <FormField
              control={form.control}
              name="deniedPermissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-red-700">Denied Permissions</FormLabel>
                  <FormDescription>
                    Explicitly deny specific permissions even if granted by the role
                  </FormDescription>
                  <div className="border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {permissionsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading permissions...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedPermissions).map(([module, modulePermissions]: [string, any[]]) => (
                          <div key={module} className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">
                              {module}
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {modulePermissions.map((permission) => (
                                <div key={permission._id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={field.value.includes(permission.code)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...field.value, permission.code]);
                                      } else {
                                        field.onChange(field.value.filter((p: string) => p !== permission.code));
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{permission.name}</div>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {permission.code}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserRoleMutation.isPending}>
                {updateUserRoleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Assignment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}