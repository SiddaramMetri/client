import API from '@/lib/axios-client';

export interface Role {
  _id: string;
  name: string;
  code: string;
  description?: string;
  level: number;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  _id: string;
  name: string;
  code: string;
  description?: string;
  module: string;
  action: string;
  isSystem: boolean;
  isActive: boolean;
}

export interface UserRole {
  _id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
  expiresAt?: string;
  customPermissions?: string[];
  deniedPermissions?: string[];
  context?: any;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  role?: Role;
}

export interface UserRoleAssignmentRequest {
  userId: string;
  roleId: string;
  customPermissions?: string[];
  deniedPermissions?: string[];
  expiresAt?: string;
  context?: any;
}

export interface UserPermissions {
  userRoles: UserRole[];
  effectivePermissions: string[];
  roleHierarchy: Role[];
}

export interface RoleStats {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  activeRoles: number;
  inactiveRoles: number;
}

export interface UserRoleStats {
  totalAssignments: number;
  activeAssignments: number;
  expiredAssignments: number;
  usersWithRoles: number;
  usersWithoutRoles: number;
}

// Role Management API
export const roleService = {
  getAllRoles: async (params?: any): Promise<{ data: Role[]; pagination: any }> => {
    const response = await API.get('/rbac/roles', { params });
    return response.data;
  },

  getRoleById: async (id: string): Promise<Role> => {
    const response = await API.get(`/rbac/roles/${id}`);
    return response.data.data;
  },

  createRole: async (roleData: Partial<Role>): Promise<Role> => {
    const response = await API.post('/rbac/roles', roleData);
    return response.data.data;
  },

  updateRole: async (id: string, roleData: Partial<Role>): Promise<Role> => {
    const response = await API.put(`/rbac/roles/${id}`, roleData);
    return response.data.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await API.delete(`/rbac/roles/${id}`);
  },

  getRoleStats: async (): Promise<RoleStats> => {
    const response = await API.get('/rbac/roles/stats');
    return response.data.data;
  }
};

// Permission Management API
export const permissionService = {
  getAllPermissions: async (params?: any): Promise<{ data: Permission[]; pagination: any }> => {
    const response = await API.get('/rbac/permissions', { params });
    return response.data;
  },

  getAllPermissionsWithoutPagination: async (): Promise<{ data: Permission[]; total: number }> => {
    const response = await API.get('/rbac/permissions/all');
    return response.data;
  },

  getPermissionById: async (id: string): Promise<Permission> => {
    const response = await API.get(`/rbac/permissions/${id}`);
    return response.data.data;
  },

  createPermission: async (permissionData: Partial<Permission>): Promise<Permission> => {
    const response = await API.post('/rbac/permissions', permissionData);
    return response.data.data;
  },

  updatePermission: async (id: string, permissionData: Partial<Permission>): Promise<Permission> => {
    const response = await API.put(`/rbac/permissions/${id}`, permissionData);
    return response.data.data;
  },

  deletePermission: async (id: string): Promise<void> => {
    await API.delete(`/rbac/permissions/${id}`);
  }
};

// User Role Assignment API
export const userRoleService = {
  getAllUserRoles: async (params?: any): Promise<{ data: UserRole[]; pagination: any }> => {
    const response = await API.get('/rbac/user-roles', { params });
    return response.data;
  },

  assignRole: async (assignmentData: UserRoleAssignmentRequest): Promise<UserRole> => {
    const response = await API.post('/rbac/user-roles', assignmentData);
    return response.data.data;
  },

  updateUserRole: async (userRoleId: string, updateData: any): Promise<UserRole> => {
    const response = await API.put(`/rbac/user-roles/${userRoleId}`, updateData);
    return response.data.data;
  },

  removeRole: async (userRoleId: string): Promise<void> => {
    await API.delete(`/rbac/user-roles/${userRoleId}`);
  },

  getUserPermissions: async (userId: string, context?: any): Promise<UserPermissions> => {
    const params = context ? { context: JSON.stringify(context) } : {};
    const response = await API.get(`/rbac/users/${userId}/permissions`, { params });
    return response.data.data;
  },

  getUserRoleStats: async (): Promise<UserRoleStats> => {
    const response = await API.get('/rbac/user-roles/stats');
    return response.data.data;
  }
};

// Export all services
export const rbacService = {
  roles: roleService,
  permissions: permissionService,
  userRoles: userRoleService
};