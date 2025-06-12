import { PermissionType } from "@/constant";
import { UserType, WorkspaceWithMembersType } from "@/types/api.type";
import { useContext, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/context/auth-provider";

export interface UserPermissions {
  permissions: string[];
  roles: Array<{
    roleId: string;
    roleName: string;
    roleCode: string;
    level: number;
    context?: {
      workspaceId?: string;
      projectId?: string;
      classId?: string;
    };
  }>;
}

// Enhanced RBAC permissions hook
export const useRBACPermissions = () => {
  const { user } = useAuthContext();

  const userPermissions: UserPermissions = useMemo(() => {
    return {
      permissions: user?.role?.permissions || [],
      roles: user?.role || []
    };
  }, [user?.role]);

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    return userPermissions.permissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => userPermissions.permissions.includes(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => userPermissions.permissions.includes(permission));
  };

  // Check if user has a specific role
  const hasRole = (roleCode: string): boolean => {
    return userPermissions.roles.some(role => role.roleCode === roleCode);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roleCodes: string[]): boolean => {
    return roleCodes.some(roleCode => hasRole(roleCode));
  };

  // Check role level (lower number = higher privilege)
  const hasMinimumRoleLevel = (level: number): boolean => {
    if (userPermissions.roles.length === 0) return false;
    const userMaxLevel = Math.min(...userPermissions.roles.map(role => role.level));
    return userMaxLevel <= level;
  };

  // Module-specific permission checks
  const canCreate = (module: string): boolean => hasPermission(`${module}:create`);
  const canRead = (module: string): boolean => hasPermission(`${module}:read`);
  const canUpdate = (module: string): boolean => hasPermission(`${module}:update`);
  const canDelete = (module: string): boolean => hasPermission(`${module}:delete`);
  const canManage = (module: string): boolean => hasPermission(`${module}:manage`);

  // Context-aware permission checks
  const hasPermissionInContext = (permission: string, context?: {
    workspaceId?: string;
    projectId?: string;
    classId?: string;
  }): boolean => {
    if (!context) return hasPermission(permission);

    // Check if user has the permission in the specific context
    const relevantRoles = userPermissions.roles.filter(role => {
      if (!role.context) return true; // Global permissions

      return (
        (!context.workspaceId || role.context.workspaceId === context.workspaceId) &&
        (!context.projectId || role.context.projectId === context.projectId) &&
        (!context.classId || role.context.classId === context.classId)
      );
    });

    return relevantRoles.length > 0 && hasPermission(permission);
  };

  // Predefined role checks
  const isSuperAdmin = (): boolean => hasRole('super_admin') || hasPermission('system:manage');
  const isAdmin = (): boolean => hasAnyRole(['super_admin', 'admin']) || hasAnyPermission(['users:manage', 'system:manage']);
  const isFaculty = (): boolean => hasAnyRole(['super_admin', 'admin', 'faculty']);
  const isStudent = (): boolean => hasRole('student');

  // Resource ownership checks (to be used with API responses)
  const canAccessOwnResource = (resourceUserId?: string): boolean => {
    return user?._id === resourceUserId;
  };

  return {
    // Permission data
    userPermissions,
    
    // Basic permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role checks
    hasRole,
    hasAnyRole,
    hasMinimumRoleLevel,
    
    // Module-specific checks
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManage,
    
    // Context-aware checks
    hasPermissionInContext,
    
    // Predefined role checks
    isSuperAdmin,
    isAdmin,
    isFaculty,
    isStudent,
    
    // Resource ownership
    canAccessOwnResource,
    
    // Utility
    isAuthenticated: !!user,
    userId: user?._id
  };
};

// Legacy workspace permissions hook (for backward compatibility)
const usePermissions = (
  user: UserType | undefined,
  workspace: WorkspaceWithMembersType | undefined
) => {
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  useEffect(() => {
    if (user && workspace) {
      const member = workspace.members.find(
        (member) => member.userId === user._id
      );
      if (member) {
        setPermissions(member.role.permissions || []);
      }
    }
  }, [user, workspace]);

  return useMemo(() => permissions, [permissions]);
};

export default usePermissions;
