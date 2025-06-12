import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAllPermissions, useCreateRole, useUpdateRole } from '@/hooks/api/use-rbac';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, CheckCircle2, Crown, Loader2, Save, Search, Shield, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const roleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  code: z.string().min(2, 'Role code must be at least 2 characters').regex(/^[a-z_]+$/, 'Role code must contain only lowercase letters and underscores'),
  description: z.string().optional(),
  level: z.number().min(1, 'Level must be at least 1').max(10, 'Level cannot exceed 10'),
  permissions: z.array(z.string()).min(1, 'Please select at least one permission'),
  isActive: z.boolean().default(true),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface EnhancedRoleDialogProps {
  role?: any; // For editing existing role
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

const ROLE_LEVELS = [
  { value: 1, label: 'Level 1 - Super Admin', description: 'Full system access', icon: Crown, color: 'text-red-600' },
  { value: 2, label: 'Level 2 - Admin', description: 'Administrative access', icon: Shield, color: 'text-orange-600' },
  { value: 3, label: 'Level 3 - Manager', description: 'Management access', icon: Users, color: 'text-blue-600' },
  { value: 4, label: 'Level 4 - User', description: 'Standard user access', icon: Users, color: 'text-green-600' },
  { value: 5, label: 'Level 5 - Viewer', description: 'Read-only access', icon: Users, color: 'text-gray-600' },
];

export default function EnhancedRoleDialog({ 
  role, 
  mode, 
  open, 
  onOpenChange, 
  children 
}: EnhancedRoleDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const { toast } = useToast();
  
  const { data: permissionsData, isLoading: permissionsLoading } = useAllPermissions();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  
  const permissions = permissionsData?.data || [];

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      level: 4,
      permissions: [],
      isActive: true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && role && open) {
      form.reset({
        name: role.name || '',
        code: role.code || '',
        description: role.description || '',
        level: role.level || 4,
        permissions: role.permissions || [],
        isActive: role.isActive !== false,
      });
    } else if (mode === 'create' && open) {
      form.reset({
        name: '',
        code: '',
        description: '',
        level: 4,
        permissions: [],
        isActive: true,
      });
    }
  }, [mode, role, open, form]);

  // Auto-generate code from name
  const watchName = form.watch('name');
  useEffect(() => {
    if (mode === 'create' && watchName) {
      const code = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 20);
      form.setValue('code', code);
    }
  }, [watchName, mode, form]);

  // Group permissions by module
  const groupedPermissions = React.useMemo(() => {
    const filtered = permissions.filter(permission => {
      const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permission.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = selectedModule === 'all' || permission.module === selectedModule;
      return matchesSearch && matchesModule;
    });

    return filtered.reduce((acc, permission) => {
      const module = permission.module || 'other';
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);
  }, [permissions, searchTerm, selectedModule]);

  // Get unique modules
  const modules = React.useMemo(() => {
    const moduleSet = new Set(permissions.map(p => p.module));
    return Array.from(moduleSet).sort();
  }, [permissions]);

  const onSubmit = (data: RoleFormData) => {
    const mutation = mode === 'create' ? createRoleMutation : updateRoleMutation;
    const payload = mode === 'edit' ? { id: role._id, data } : data;

    mutation.mutate(payload as any, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
        toast({
          title: `Role ${mode === 'create' ? 'Created' : 'Updated'}`,
          description: `Successfully ${mode === 'create' ? 'created' : 'updated'} role: ${data.name}`,
        });
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: `${mode === 'create' ? 'Creation' : 'Update'} Failed`,
          description: error.response?.data?.message || `Failed to ${mode} role`,
        });
      },
    });
  };

  const handleSelectAll = (modulePermissions: any[], checked: boolean) => {
    const currentPermissions = form.getValues('permissions');
    const modulePermissionCodes = modulePermissions.map(p => p.code);
    
    if (checked) {
      // Add all module permissions
      const newPermissions = [...new Set([...currentPermissions, ...modulePermissionCodes])];
      form.setValue('permissions', newPermissions);
    } else {
      // Remove all module permissions
      const newPermissions = currentPermissions.filter(p => !modulePermissionCodes.includes(p));
      form.setValue('permissions', newPermissions);
    }
  };

  const isModuleSelected = (modulePermissions: any[]) => {
    const currentPermissions = form.getValues('permissions');
    const modulePermissionCodes = modulePermissions.map(p => p.code);
    return modulePermissionCodes.every(code => currentPermissions.includes(code));
  };

  const isModulePartiallySelected = (modulePermissions: any[]) => {
    const currentPermissions = form.getValues('permissions');
    const modulePermissionCodes = modulePermissions.map(p => p.code);
    const selectedCount = modulePermissionCodes.filter(code => currentPermissions.includes(code)).length;
    return selectedCount > 0 && selectedCount < modulePermissionCodes.length;
  };

  const selectedLevel = ROLE_LEVELS.find(level => level.value === form.watch('level'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {mode === 'create' ? 'Create New Role' : `Edit Role: ${role?.name}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new role with specific permissions and access levels'
              : 'Modify role details and permissions. System roles have restrictions on certain fields.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Teacher, Student, Admin" 
                            {...field}
                            disabled={mode === 'edit' && role?.isSystem}
                          />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for this role
                        </FormDescription>
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
                            placeholder="e.g., teacher, student, admin" 
                            {...field}
                            disabled={mode === 'edit' && role?.isSystem}
                          />
                        </FormControl>
                        <FormDescription>
                          Unique identifier (auto-generated)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Level</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value?.toString()}
                        disabled={mode === 'edit' && role?.isSystem}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLE_LEVELS.map((level) => {
                            const Icon = level.icon;
                            return (
                              <SelectItem key={level.value} value={level.value.toString()}>
                                <div className="flex items-center space-x-2">
                                  <Icon className={`w-4 h-4 ${level.color}`} />
                                  <div>
                                    <div className="font-medium">{level.label}</div>
                                    <div className="text-xs text-gray-500">{level.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Lower numbers indicate higher privilege levels
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the purpose and responsibilities of this role..."
                          className="resize-none"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description of role responsibilities
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
                          Only active roles can be assigned to users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={mode === 'edit' && role?.isSystem}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {mode === 'edit' && role?.isSystem && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <h3 className="text-yellow-800 font-medium">System Role</h3>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      This is a system role. Some fields cannot be modified to maintain system integrity.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {modules.map((module) => (
                        <SelectItem key={module} value={module}>
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="permissions"
                  render={() => (
                    <FormItem>
                      <FormLabel>Permissions</FormLabel>
                      <ScrollArea className="h-96 w-full border rounded-lg p-4">
                        <div className="space-y-6">
                          {permissionsLoading ? (
                            <div className="text-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Loading permissions...</p>
                            </div>
                          ) : Object.keys(groupedPermissions).length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500">No permissions found</p>
                            </div>
                          ) : (
                            Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                              <div key={module} className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium capitalize">{module} Module</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {modulePermissions.length} permissions
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={isModuleSelected(modulePermissions)}
                                      onCheckedChange={(checked) => 
                                        handleSelectAll(modulePermissions, checked as boolean)
                                      }
                                      className={isModulePartiallySelected(modulePermissions) ? "data-[state=checked]:bg-orange-500" : ""}
                                    />
                                    <span className="text-xs text-gray-500">Select All</span>
                                  </div>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                  {modulePermissions.map((permission) => (
                                    <FormField
                                      key={permission._id}
                                      control={form.control}
                                      name="permissions"
                                      render={({ field }) => (
                                        <FormItem
                                          key={permission._id}
                                          className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3 hover:bg-gray-50"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(permission.code)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, permission.code])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== permission.code
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm font-medium">
                                                {permission.name}
                                              </span>
                                              <Badge variant="secondary" className="text-xs">
                                                {permission.action}
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono">
                                              {permission.code}
                                            </p>
                                            {permission.description && (
                                              <p className="text-xs text-gray-500">
                                                {permission.description}
                                              </p>
                                            )}
                                          </div>
                                        </FormItem>
                                      )}
                                    />
                                  ))}
                                </div>
                                <Separator />
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                      <FormDescription>
                        Select the permissions this role should have. Users with this role will inherit these permissions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedLevel && (
                        <selectedLevel.icon className={`w-8 h-8 ${selectedLevel.color}`} />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{form.watch('name') || 'Role Name'}</h3>
                        <p className="text-sm text-gray-500 font-mono">{form.watch('code') || 'role_code'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={selectedLevel?.color.replace('text-', 'bg-').replace('-600', '-100')}>
                        Level {form.watch('level')}
                      </Badge>
                      <Badge variant={form.watch('isActive') ? 'default' : 'secondary'}>
                        {form.watch('isActive') ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {form.watch('description') && (
                    <p className="text-gray-700">{form.watch('description')}</p>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                      Selected Permissions ({form.watch('permissions')?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {form.watch('permissions')?.map((permissionCode) => {
                        const permission = permissions.find(p => p.code === permissionCode);
                        return (
                          <Badge key={permissionCode} variant="outline" className="text-xs">
                            {permission?.name || permissionCode}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                className="min-w-24"
              >
                {(createRoleMutation.isPending || updateRoleMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Create Role' : 'Update Role'}
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