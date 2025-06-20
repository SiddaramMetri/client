import { AdminOnlyGuard, RBACPermissionGuard } from '@/components/resuable/permission-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useDeletePermission,
  useDeleteRole,
  usePermissions,
  useRoles,
  useRoleStats,
  useUserRoles,
  useUserRoleStats
} from '@/hooks/api/use-rbac';
import { useRBACPermissions } from '@/hooks/use-permissions';
import { AlertTriangle, Edit, Eye, Key, Plus, Search, Shield, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import CreatePermissionDialog from './components/create-permission-dialog';
import CreateRoleDialog from './components/create-role-dialog';
import EditRoleDialog from './components/edit-role-dialog';
import RolesManagement from './components/roles-management';

// Replace mock data with real API calls
function PermissionsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [deleteRoleOpen, setDeleteRoleOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<any>(null);
  const [deletePermissionOpen, setDeletePermissionOpen] = useState(false);

  const { 
    userPermissions, 
    isSuperAdmin, 
    isAdmin,
  } = useRBACPermissions();

  // Fetch data using the RBAC hooks
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRoles();
  const { data: permissionsData, isLoading: permissionsLoading, error: permissionsError } = usePermissions();
  const { data: userRolesData, isLoading: userRolesLoading } = useUserRoles();
  const { data: roleStats } = useRoleStats();
  const { data: userRoleStats } = useUserRoleStats();

  // Mutation hooks for CRUD operations
  const deleteRoleMutation = useDeleteRole();
  const deletePermissionMutation = useDeletePermission();

  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];
  const userRoles = userRolesData?.data || [];

  // Filter data based on search
  const filteredRoles = roles.filter((role: any) => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermissions = permissions.filter((permission: any) => 
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserRoles = userRoles.filter((userRole: any) => 
    userRole.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userRole.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // CRUD operation handlers
  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setEditRoleOpen(true);
  };

  const handleDeleteRole = (role: any) => {
    setSelectedRole(role);
    setDeleteRoleOpen(true);
  };

  const handleEditPermission = (permission: any) => {
    setSelectedPermission(permission);
  };

  const handleDeletePermission = (permission: any) => {
    setSelectedPermission(permission);
    setDeletePermissionOpen(true);
  };

  const confirmDeleteRole = () => {
    if (selectedRole) {
      deleteRoleMutation.mutate(selectedRole._id, {
        onSuccess: () => {
          setDeleteRoleOpen(false);
          setSelectedRole(null);
        }
      });
    }
  };

  return (
    <AdminOnlyGuard fallback={
      <div className="flex items-center justify-center h-64">
        <Card className="p-6">
          <CardContent className="text-center">
            <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to access the permissions management system.</p>
          </CardContent>
        </Card>
      </div>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissions Management</h1>
            <p className="text-muted-foreground">
              Manage roles, permissions, and user access across the system
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50">
              <Shield className="w-3 h-3 mr-1" />
              {userPermissions.permissions.length} Permissions
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              <Users className="w-3 h-3 mr-1" />
              {userPermissions.roles.length} Roles
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {(rolesError || permissionsError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-red-800 font-medium">Error Loading Data</h3>
            </div>
            <div className="mt-2 text-red-700 text-sm">
              {rolesError && <p>Roles: {rolesError.message}</p>}
              {permissionsError && <p>Permissions: {permissionsError.message}</p>}
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rolesLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  roleStats?.totalRoles || roles.length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {rolesLoading ? (
                  <div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `${roleStats?.systemRoles || roles.filter(r => r.isSystem).length} system roles`
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permissions.length}</div>
              <p className="text-xs text-muted-foreground">
                {new Set(permissions.map(p => p.module)).size} modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userRoleStats?.usersWithRoles || userRoles.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {userRoleStats?.usersWithoutRoles || 0} unassigned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Access Level</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isSuperAdmin() ? 'Super Admin' : isAdmin() ? 'Admin' : 'Limited'}
              </div>
              <p className="text-xs text-muted-foreground">
                {userPermissions.permissions.length} permissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles, permissions, or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="roles-management">Roles Management</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="user-roles">User Assignments</TabsTrigger>
            <TabsTrigger value="my-permissions">My Permissions</TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Roles Management</CardTitle>
                    <CardDescription>
                      Create and manage user roles with specific permission sets
                    </CardDescription>
                  </div>
                  <RBACPermissionGuard permissions="role:create">
                    <CreateRoleDialog>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Role
                      </Button>
                    </CreateRoleDialog>
                  </RBACPermissionGuard>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolesLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading roles...
                        </TableCell>
                      </TableRow>
                    ) : filteredRoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No roles found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoles.map((role: any) => (
                        <TableRow key={role._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{role.name}</div>
                              <div className="text-sm text-gray-500">{role.description || 'No description'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{role.code}</Badge>
                          </TableCell>
                          <TableCell>{role.level}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {/* TODO: Calculate user count from userRoles */}
                              {userRoles.filter((ur: any) => ur.roleId === role._id).length}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {role.permissions?.length || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={role.isActive ? "default" : "secondary"}>
                              {role.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <RBACPermissionGuard permissions="role:read">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </RBACPermissionGuard>
                              <RBACPermissionGuard permissions="role:update">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditRole(role)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </RBACPermissionGuard>
                              <RBACPermissionGuard permissions="role:delete">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  disabled={role.isSystem}
                                  onClick={() => handleDeleteRole(role)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </RBACPermissionGuard>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Roles Management Tab */}
          <TabsContent value="roles-management">
            <RolesManagement />
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Permissions Management</CardTitle>
                    <CardDescription>
                      Define granular permissions for system modules and actions
                    </CardDescription>
                  </div>
                  <RBACPermissionGuard permissions="permission:create">
                    <CreatePermissionDialog>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Permission
                      </Button>
                    </CreatePermissionDialog>
                  </RBACPermissionGuard>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading permissions...
                        </TableCell>
                      </TableRow>
                    ) : filteredPermissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No permissions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPermissions.map((permission) => (
                        <TableRow key={permission._id}>
                          <TableCell className="font-medium">{permission.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {permission.code}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="capitalize">{permission.module}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">{permission.action}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={permission.isSystem ? "default" : "outline"}>
                              {permission.isSystem ? "System" : "Custom"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <RBACPermissionGuard permissions="permission:read">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </RBACPermissionGuard>
                              <RBACPermissionGuard permissions="permission:update">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditPermission(permission)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </RBACPermissionGuard>
                              <RBACPermissionGuard permissions="permission:delete">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  disabled={permission.isSystem}
                                  onClick={() => handleDeletePermission(permission)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </RBACPermissionGuard>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Role Assignments Tab */}
          <TabsContent value="user-roles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Role Assignments</CardTitle>
                    <CardDescription>
                      Manage which roles are assigned to which users
                    </CardDescription>
                  </div>
                  {/* <RBACPermissionGuard permissions="user_role:create"> */}
                    <Button onClick={() => window.location.href = '/dashboard/user-roles'}>
                      <Plus className="w-4 h-4 mr-2" />
                      Assign Role
                    </Button>
                  {/* </RBACPermissionGuard> */}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRolesLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading user role assignments...
                        </TableCell>
                      </TableRow>
                    ) : filteredUserRoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No user role assignments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUserRoles.map((userRole) => (
                        <TableRow key={userRole._id}>
                          <TableCell className="font-medium">
                            {(userRole.userId as any)?.name || 'Unknown User'}
                          </TableCell>
                          <TableCell>
                            {(userRole.userId as any)?.email || 'No email'}
                          </TableCell>
                          <TableCell>
                            <Badge>{(userRole.roleId as any)?.name || 'Unknown Role'}</Badge>
                          </TableCell>
                          <TableCell>
                            {userRole.assignedAt ? new Date(userRole.assignedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {/* <RBACPermissionGuard permissions="user_role:update"> */}
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            {/* </RBACPermissionGuard> */}
                            {/* <RBACPermissionGuard permissions="user_role:delete"> */}
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            {/* </RBACPermissionGuard> */}
                          </div>
                        </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Permissions Tab */}
          <TabsContent value="my-permissions">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Roles</CardTitle>
                  <CardDescription>
                    Roles currently assigned to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userPermissions.roles.map((role, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{role.roleName}</div>
                          <div className="text-sm text-gray-500">Level {role.level}</div>
                        </div>
                        <Badge variant="outline">{role.roleCode}</Badge>
                      </div>
                    ))}
                    {userPermissions.roles.length === 0 && (
                      <p className="text-gray-500 text-sm">No roles assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Permissions</CardTitle>
                  <CardDescription>
                    All permissions granted through your roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {userPermissions.permissions.map((permission, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm font-mono">
                        {permission}
                      </div>
                    ))}
                    {userPermissions.permissions.length === 0 && (
                      <p className="text-gray-500 text-sm">No permissions assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Role Confirmation Dialog */}
        <Dialog open={deleteRoleOpen} onOpenChange={setDeleteRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Role</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeleteRoleOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteRole}
                disabled={deleteRoleMutation.isPending}
              >
                {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Permission Confirmation Dialog */}
        <Dialog open={deletePermissionOpen} onOpenChange={setDeletePermissionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Permission</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the permission "{selectedPermission?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeletePermissionOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (selectedPermission) {
                    deletePermissionMutation.mutate(selectedPermission._id, {
                      onSuccess: () => {
                        setDeletePermissionOpen(false);
                        setSelectedPermission(null);
                      }
                    });
                  }
                }}
                disabled={deletePermissionMutation.isPending}
              >
                {deletePermissionMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <EditRoleDialog 
          role={selectedRole}
          open={editRoleOpen}
          onOpenChange={setEditRoleOpen}
        />
      </div>
    </AdminOnlyGuard>
  );
};

export default PermissionsManagementPage;