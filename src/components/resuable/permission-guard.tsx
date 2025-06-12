import React from "react";
import { PermissionType } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import { useRBACPermissions } from "@/hooks/use-permissions";

// Legacy permission guard props
type LegacyPermissionsGuardProps = {
  requiredPermission: PermissionType;
  children: React.ReactNode;
  showMessage?: boolean;
};

// Enhanced RBAC permission guard props
type RBACPermissionGuardProps = {
  permissions?: string | string[];
  roles?: string | string[];
  requireAll?: boolean;
  minRoleLevel?: number;
  context?: {
    workspaceId?: string;
    projectId?: string;
    classId?: string;
  };
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
  customMessage?: string;
};

// Enhanced RBAC Permission Guard
export const RBACPermissionGuard: React.FC<RBACPermissionGuardProps> = ({
  permissions,
  roles,
  requireAll = false,
  minRoleLevel,
  context,
  children,
  fallback,
  showMessage = false,
  customMessage = "You do not have permission to view this content"
}) => {
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

  // If user is not authenticated, don't show anything
  if (!isAuthenticated) {
    return fallback || null;
  }

  let hasAccess = true;

  // Check permissions
  if (permissions) {
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
    
    if (context) {
      // Check permissions in specific context
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

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showMessage) {
      return (
        <div className="text-center text-sm pt-3 italic w-full text-muted-foreground">
          {customMessage}
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

// Utility permission guards for common patterns
export const AdminOnlyGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RBACPermissionGuard 
    roles={['super_admin', 'admin']} 
    fallback={fallback}
  >
    {children}
  </RBACPermissionGuard>
);

export const FacultyGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RBACPermissionGuard 
    roles={['super_admin', 'admin', 'faculty']} 
    fallback={fallback}
  >
    {children}
  </RBACPermissionGuard>
);

export const CreatePermissionGuard: React.FC<{ module: string; children: React.ReactNode; fallback?: React.ReactNode }> = ({ module, children, fallback }) => (
  <RBACPermissionGuard 
    permissions={`${module}:create`} 
    fallback={fallback}
  >
    {children}
  </RBACPermissionGuard>
);

export const UpdatePermissionGuard: React.FC<{ module: string; children: React.ReactNode; fallback?: React.ReactNode }> = ({ module, children, fallback }) => (
  <RBACPermissionGuard 
    permissions={`${module}:update`} 
    fallback={fallback}
  >
    {children}
  </RBACPermissionGuard>
);

export const DeletePermissionGuard: React.FC<{ module: string; children: React.ReactNode; fallback?: React.ReactNode }> = ({ module, children, fallback }) => (
  <RBACPermissionGuard 
    permissions={`${module}:delete`} 
    fallback={fallback}
  >
    {children}
  </RBACPermissionGuard>
);

export const ManagePermissionGuard: React.FC<{ module: string; children: React.ReactNode; fallback?: React.ReactNode }> = ({ module, children, fallback }) => (
  <RBACPermissionGuard 
    permissions={`${module}:manage`} 
    fallback={fallback}
  >
    {children}
  </RBACPermissionGuard>
);

// Legacy permission guard (for backward compatibility)
const PermissionsGuard: React.FC<LegacyPermissionsGuardProps> = ({
  requiredPermission,
  showMessage = false,
  children,
}) => {
  const { hasPermission } = useAuthContext();

  if (!hasPermission(requiredPermission)) {
    return (
      showMessage && (
        <div
          className="text-center 
        text-sm pt-3
        italic
        w-full
        text-muted-foreground"
        >
          You do not have the permission to view this
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default PermissionsGuard;
