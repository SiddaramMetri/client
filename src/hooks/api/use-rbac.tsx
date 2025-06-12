import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rbacService, UserRoleAssignmentRequest } from '@/services/rbac.service';
import { useToast } from '@/components/ui/use-toast';

// Role Management Hooks
export const useRoles = (params?: any) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => rbacService.roles.getAllRoles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => rbacService.roles.getRoleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: rbacService.roles.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Role Created',
        description: 'Role has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create role.',
      });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      rbacService.roles.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Role Updated',
        description: 'Role has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update role.',
      });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: rbacService.roles.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Role Deleted',
        description: 'Role has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete role.',
      });
    },
  });
};

export const useRoleStats = () => {
  return useQuery({
    queryKey: ['roles', 'stats'],
    queryFn: rbacService.roles.getRoleStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Permission Management Hooks
export const usePermissions = (params?: any) => {
  return useQuery({
    queryKey: ['permissions', params],
    queryFn: () => rbacService.permissions.getAllPermissions(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: rbacService.permissions.createPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast({
        title: 'Permission Created',
        description: 'Permission has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create permission.',
      });
    },
  });
};

// User Role Assignment Hooks
export const useUserRoles = (params?: any) => {
  return useQuery({
    queryKey: ['user-roles', params],
    queryFn: () => rbacService.userRoles.getAllUserRoles(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UserRoleAssignmentRequest) =>
      rbacService.userRoles.assignRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Role Assigned',
        description: 'Role has been assigned successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to assign role.',
      });
    },
  });
};

export const useRemoveRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: rbacService.userRoles.removeRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Role Removed',
        description: 'Role has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove role.',
      });
    },
  });
};

export const useUserPermissions = (userId: string, context?: any) => {
  return useQuery({
    queryKey: ['user-permissions', userId, context],
    queryFn: () => rbacService.userRoles.getUserPermissions(userId, context),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUserRoleStats = () => {
  return useQuery({
    queryKey: ['user-roles', 'stats'],
    queryFn: rbacService.userRoles.getUserRoleStats,
    staleTime: 2 * 60 * 1000,
  });
};