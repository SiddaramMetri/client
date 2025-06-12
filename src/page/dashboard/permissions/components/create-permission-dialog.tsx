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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreatePermission } from '@/hooks/api/use-rbac';
import { Plus, Shield } from 'lucide-react';

const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  code: z.string().min(1, 'Permission code is required').regex(/^[a-z_:]+$/, 'Code must contain only lowercase letters, underscores, and colons'),
  description: z.string().optional(),
  module: z.string().min(1, 'Module is required'),
  action: z.string().min(1, 'Action is required'),
});

type CreatePermissionFormData = z.infer<typeof createPermissionSchema>;

// Common modules and actions
const MODULES = [
  'system',
  'users', 
  'students',
  'classes',
  'academic_years',
  'roles',
  'permissions',
  'user_roles',
  'audit_logs',
  'profile',
  'grades',
  'attendance',
  'workspace',
  'projects',
  'tasks'
];

const ACTIONS = [
  'create',
  'read', 
  'update',
  'delete',
  'manage',
  'view',
  'list'
];

interface CreatePermissionDialogProps {
  children?: React.ReactNode;
}

const CreatePermissionDialog: React.FC<CreatePermissionDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createPermissionMutation = useCreatePermission();

  const form = useForm<CreatePermissionFormData>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      module: '',
      action: '',
    },
  });

  const onSubmit = (data: CreatePermissionFormData) => {
    createPermissionMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({
          title: 'Permission Created',
          description: `Successfully created permission: ${data.name}`,
        });
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: error.response?.data?.message || 'Failed to create permission',
        });
      },
    });
  };

  // Auto-generate code based on module and action
  const watchModule = form.watch('module');
  const watchAction = form.watch('action');
  
  React.useEffect(() => {
    if (watchModule && watchAction) {
      const code = `${watchModule}:${watchAction}`;
      form.setValue('code', code);
    }
  }, [watchModule, watchAction, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Permission
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Create New Permission
          </DialogTitle>
          <DialogDescription>
            Create a new permission to control access to system features and data.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permission Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., User Create" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A human-readable name for this permission
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODULES.map((module) => (
                          <SelectItem key={module} value={module}>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {module}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIONS.map((action) => (
                          <SelectItem key={action} value={action}>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {action}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permission Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., users:create" 
                      {...field} 
                      readOnly
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormDescription>
                    Auto-generated based on module and action
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this permission allows..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPermissionMutation.isPending}
              >
                {createPermissionMutation.isPending ? 'Creating...' : 'Create Permission'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePermissionDialog;