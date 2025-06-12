import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRBACPermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

interface PermissionButtonProps extends ButtonProps {
  permissions?: string | string[];
  roles?: string | string[];
  requireAll?: boolean;
  minRoleLevel?: number;
  context?: {
    workspaceId?: string;
    projectId?: string;
    classId?: string;
  };
  fallback?: React.ReactNode;
  hideWhenNoAccess?: boolean;
  disableWhenNoAccess?: boolean;
  noAccessMessage?: string;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permissions,
  roles,
  requireAll = false,
  minRoleLevel,
  context,
  fallback,
  hideWhenNoAccess = false,
  disableWhenNoAccess = true,
  noAccessMessage = "You don't have permission to perform this action",
  children,
  onClick,
  disabled,
  className,
  ...props
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

  // If user is not authenticated, hide or disable
  if (!isAuthenticated) {
    if (hideWhenNoAccess) return fallback || null;
    if (disableWhenNoAccess) {
      return (
        <Button
          {...props}
          disabled={true}
          className={cn(className, "opacity-50 cursor-not-allowed")}
          title="Authentication required"
        >
          {children}
        </Button>
      );
    }
  }

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

  if (!hasAccess) {
    if (hideWhenNoAccess) {
      return fallback || null;
    }
    
    if (disableWhenNoAccess) {
      return (
        <Button
          {...props}
          disabled={true}
          className={cn(className, "opacity-50 cursor-not-allowed")}
          title={noAccessMessage}
        >
          {children}
        </Button>
      );
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasAccess && !disableWhenNoAccess) {
      e.preventDefault();
      // Could show a toast message here
      console.warn(noAccessMessage);
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      {...props}
      disabled={disabled || (!hasAccess && disableWhenNoAccess)}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Button>
  );
};

// Utility permission buttons for common actions
export const CreateButton: React.FC<Omit<PermissionButtonProps, 'permissions'> & { module: string }> = ({ 
  module, 
  children = "Create", 
  ...props 
}) => (
  <PermissionButton permissions={`${module}:create`} {...props}>
    {children}
  </PermissionButton>
);

export const EditButton: React.FC<Omit<PermissionButtonProps, 'permissions'> & { module: string }> = ({ 
  module, 
  children = "Edit", 
  ...props 
}) => (
  <PermissionButton permissions={`${module}:update`} {...props}>
    {children}
  </PermissionButton>
);

export const DeleteButton: React.FC<Omit<PermissionButtonProps, 'permissions'> & { module: string }> = ({ 
  module, 
  children = "Delete", 
  variant = "destructive",
  ...props 
}) => (
  <PermissionButton permissions={`${module}:delete`} variant={variant} {...props}>
    {children}
  </PermissionButton>
);

export const AdminButton: React.FC<Omit<PermissionButtonProps, 'roles'>> = ({ 
  children, 
  ...props 
}) => (
  <PermissionButton roles={['super_admin', 'admin']} {...props}>
    {children}
  </PermissionButton>
);

export const FacultyButton: React.FC<Omit<PermissionButtonProps, 'roles'>> = ({ 
  children, 
  ...props 
}) => (
  <PermissionButton roles={['super_admin', 'admin', 'faculty']} {...props}>
    {children}
  </PermissionButton>
);

// Context-specific buttons
export const WorkspaceButton: React.FC<Omit<PermissionButtonProps, 'context'> & { 
  workspaceId: string;
  permission: string;
}> = ({ 
  workspaceId, 
  permission, 
  children, 
  ...props 
}) => (
  <PermissionButton 
    permissions={permission} 
    context={{ workspaceId }} 
    {...props}
  >
    {children}
  </PermissionButton>
);

export const ProjectButton: React.FC<Omit<PermissionButtonProps, 'context'> & { 
  projectId: string;
  permission: string;
}> = ({ 
  projectId, 
  permission, 
  children, 
  ...props 
}) => (
  <PermissionButton 
    permissions={permission} 
    context={{ projectId }} 
    {...props}
  >
    {children}
  </PermissionButton>
);

export const ClassButton: React.FC<Omit<PermissionButtonProps, 'context'> & { 
  classId: string;
  permission: string;
}> = ({ 
  classId, 
  permission, 
  children, 
  ...props 
}) => (
  <PermissionButton 
    permissions={permission} 
    context={{ classId }} 
    {...props}
  >
    {children}
  </PermissionButton>
);