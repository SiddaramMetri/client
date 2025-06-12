import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleService, permissionService } from '@/services/rbac.service';

const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  code: z.string().min(2, 'Role code must be at least 2 characters').regex(/^[a-z_]+$/, 'Role code must contain only lowercase letters and underscores'),
  description: z.string().optional(),
  level: z.number().min(1).max(10),
  permissions: z.array(z.string()).min(1, 'Please select at least one permission'),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

interface CreateRoleDialogProps {
  children?: React.ReactNode;
}

export default function CreateRoleDialog({ children }: CreateRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      level: 5,
      permissions: [],
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: roleService.createRole,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-stats'] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create role',
      });
    },
  });

  const onSubmit = (data: CreateRoleFormData) => {
    createRoleMutation.mutate({
      ...data,
      isSystem: false,
      isActive: true,
    });
  };

  // Auto-generate code from name
  const handleNameChange = (name: string) => {
    const code = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    form.setValue('code', code);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role with specific permissions. Users assigned this role will have access to the selected permissions.
          </DialogDescription>
        </DialogHeader>
        
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
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
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
                      <Input placeholder="e.g., content_manager" {...field} />
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRoleMutation.isPending}>
                {createRoleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Role
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