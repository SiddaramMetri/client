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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { permissionService } from '@/services/rbac.service';
import { useUpdateRole } from '@/hooks/api/use-rbac';

const editRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  code: z.string().min(2, 'Role code must be at least 2 characters').regex(/^[a-z_]+$/, 'Role code must contain only lowercase letters and underscores'),
  description: z.string().optional(),
  level: z.number().min(1).max(10),
  permissions: z.array(z.string()).min(1, 'Please select at least one permission'),
  isActive: z.boolean(),
});

type EditRoleFormData = z.infer<typeof editRoleSchema>;

interface EditRoleDialogProps {
  role: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditRoleDialog({ role, open, onOpenChange }: EditRoleDialogProps) {
  const { toast } = useToast();
  const updateRoleMutation = useUpdateRole();

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

  const form = useForm<EditRoleFormData>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      name: role?.name || '',
      code: role?.code || '',
      description: role?.description || '',
      level: role?.level || 5,
      permissions: role?.permissions || [],
      isActive: role?.isActive ?? true,
    },
  });

  // Update form when role changes
  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name || '',
        code: role.code || '',
        description: role.description || '',
        level: role.level || 5,
        permissions: role.permissions || [],
        isActive: role.isActive ?? true,
      });
    }
  }, [role, form]);

  const onSubmit = (data: EditRoleFormData) => {
    updateRoleMutation.mutate({
      id: role._id,
      data: {
        ...data,
        permissions: data.permissions.map(code => ({ code })), // Convert to proper format
      }
    }, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Role updated successfully',
        });
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update role',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Role: {role?.name}</DialogTitle>
          <DialogDescription>
            Modify role permissions and settings. {role?.isSystem && (
              <span className="text-red-600 font-medium">
                This is a system role - some changes may be restricted.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {role?.isSystem && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>System Role Warning:</strong> This is a critical system role. Modifying it may affect system functionality.
            </div>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Content Manager"
                        {...field}
                        disabled={role?.isSystem}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., content_manager" 
                        {...field} 
                        disabled={role?.isSystem}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier (lowercase, underscores only)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this role is for..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={role?.isSystem}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers = higher privilege (1 = highest, 10 = lowest)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable this role
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={role?.isSystem}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <FormDescription>
                    Select the permissions this role should have
                  </FormDescription>
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                    {permissionsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading permissions...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedPermissions).map(([module, modulePermissions]: [string, any[]]) => (
                          <div key={module} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">
                                {module}
                              </h4>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const moduleCodes = modulePermissions.map(p => p.code);
                                    const allSelected = moduleCodes.every(code => field.value.includes(code));
                                    if (allSelected) {
                                      // Deselect all
                                      field.onChange(field.value.filter(p => !moduleCodes.includes(p)));
                                    } else {
                                      // Select all
                                      const newPermissions = [...new Set([...field.value, ...moduleCodes])];
                                      field.onChange(newPermissions);
                                    }
                                  }}
                                >
                                  {modulePermissions.every(p => field.value.includes(p.code)) ? 'Deselect All' : 'Select All'}
                                </Button>
                              </div>
                            </div>
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
                                    <div className="text-xs text-gray-500">{permission.description}</div>
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
              <Button type="submit" disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Role
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