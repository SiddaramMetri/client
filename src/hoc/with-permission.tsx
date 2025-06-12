/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { PermissionType } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import { useRBACPermissions } from "@/hooks/use-permissions";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Enhanced RBAC HOC props
interface RBACPermissionOptions {
  permissions?: string | string[];
  roles?: string | string[];
  requireAll?: boolean;
  minRoleLevel?: number;
  context?: {
    workspaceId?: string;
    projectId?: string;
    classId?: string;
  };
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

// Enhanced RBAC HOC
export const withRBACPermission = (
  WrappedComponent: React.ComponentType,
  options: RBACPermissionOptions
) => {
  const WithRBACPermission = (props: any) => {
    const { user, isLoading } = useAuthContext();
    const {
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      hasMinimumRoleLevel,
      hasPermissionInContext,
      isAuthenticated
    } = useRBACPermissions();
    const navigate = useNavigate();
    const workspaceId = useWorkspaceId();

    const {
      permissions,
      roles,
      requireAll = false,
      minRoleLevel,
      context,
      redirectTo = "/dashboard",
      fallbackComponent: FallbackComponent
    } = options;

    useEffect(() => {
      if (!isLoading && (!isAuthenticated || !checkAccess())) {
        navigate(redirectTo);
      }
    }, [user, isAuthenticated, navigate, workspaceId]);

    const checkAccess = (): boolean => {
      if (!isAuthenticated) return false;

      let hasAccess = true;

      // Check permissions
      if (permissions) {
        const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
        
        if (context) {
          hasAccess = permissionArray.some(permission => 
            hasPermissionInContext(permission, context)
          );
        } else if (requireAll) {
          hasAccess = hasAllPermissions(permissionArray);
        } else {
          hasAccess = hasAnyPermission(permissionArray);
        }
      }

      // Check roles
      if (hasAccess && roles) {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        
        if (requireAll) {
          hasAccess = roleArray.every(role => hasRole(role));
        } else {
          hasAccess = hasAnyRole(roleArray);
        }
      }

      // Check minimum role level
      if (hasAccess && minRoleLevel !== undefined) {
        hasAccess = hasMinimumRoleLevel(minRoleLevel);
      }

      return hasAccess;
    };

    if (isLoading) {
      return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    // Check if user has the required access
    if (!isAuthenticated || !checkAccess()) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />;
      }
      return null;
    }

    // If the user has permission, render the wrapped component
    return <WrappedComponent {...props} />;
  };
  
  WithRBACPermission.displayName = `withRBACPermission(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithRBACPermission;
};

// Utility HOCs for common patterns
export const withAdminAccess = (WrappedComponent: React.ComponentType) =>
  withRBACPermission(WrappedComponent, {
    roles: ['super_admin', 'admin'],
    redirectTo: "/unauthorized"
  });

export const withFacultyAccess = (WrappedComponent: React.ComponentType) =>
  withRBACPermission(WrappedComponent, {
    roles: ['super_admin', 'admin', 'faculty']
  });

export const withSuperAdminAccess = (WrappedComponent: React.ComponentType) =>
  withRBACPermission(WrappedComponent, {
    roles: ['super_admin'],
    redirectTo: "/unauthorized"
  });

export const withModulePermission = (
  WrappedComponent: React.ComponentType,
  module: string,
  action: string = 'read'
) =>
  withRBACPermission(WrappedComponent, {
    permissions: `${module}:${action}`
  });

export const withCreatePermission = (WrappedComponent: React.ComponentType, module: string) =>
  withModulePermission(WrappedComponent, module, 'create');

export const withUpdatePermission = (WrappedComponent: React.ComponentType, module: string) =>
  withModulePermission(WrappedComponent, module, 'update');

export const withDeletePermission = (WrappedComponent: React.ComponentType, module: string) =>
  withModulePermission(WrappedComponent, module, 'delete');

export const withManagePermission = (WrappedComponent: React.ComponentType, module: string) =>
  withModulePermission(WrappedComponent, module, 'manage');

// Legacy HOC (for backward compatibility)
const withPermission = (
  WrappedComponent: React.ComponentType,
  requiredPermission: PermissionType
) => {
  const WithPermission = (props: any) => {
    const { user, hasPermission, isLoading } = useAuthContext();
    const navigate = useNavigate();
    const workspaceId = useWorkspaceId();

    useEffect(() => {
      if (!user || !hasPermission(requiredPermission)) {
        navigate(`/dashboard`);
      }
    }, [user, hasPermission, navigate, workspaceId]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    // Check if user has the required permission
    if (!user || !hasPermission(requiredPermission)) {
      return;
    }
    // If the user has permission, render the wrapped component
    return <WrappedComponent {...props} />;
  };
  return WithPermission;
};

export default withPermission;
