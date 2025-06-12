import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RBACPermissionGuard, AdminOnlyGuard } from '@/components/resuable/permission-guard';
import { useRBACPermissions } from '@/hooks/use-permissions';
import { Shield, Users, Key, Settings, Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock data - replace with real API calls
const mockRoles = [
  {
    id: '1',
    name: 'Super Administrator',
    code: 'super_admin',
    description: 'Full system access with all permissions',
    level: 1,
    userCount: 2,
    permissionCount: 50,
    isSystem: true,
    isActive: true,
  },
  {
    id: '2',
    name: 'Administrator',
    code: 'admin',
    description: 'Administrative access to manage users and system settings',
    level: 2,
    userCount: 5,
    permissionCount: 35,
    isSystem: true,
    isActive: true,
  },
  {
    id: '3',
    name: 'Faculty',
    code: 'faculty',
    description: 'Teaching staff with access to students and classes',
    level: 3,
    userCount: 25,
    permissionCount: 20,
    isSystem: true,
    isActive: true,
  },
  {
    id: '4',
    name: 'Student',
    code: 'student',
    description: 'Student access to view their own information',
    level: 4,
    userCount: 150,
    permissionCount: 8,
    isSystem: true,
    isActive: true,
  },
];

const mockPermissions = [
  { id: '1', name: 'User Create', code: 'users:create', module: 'users', action: 'create', isSystem: true },
  { id: '2', name: 'User Read', code: 'users:read', module: 'users', action: 'read', isSystem: true },
  { id: '3', name: 'User Update', code: 'users:update', module: 'users', action: 'update', isSystem: true },
  { id: '4', name: 'User Delete', code: 'users:delete', module: 'users', action: 'delete', isSystem: true },
  { id: '5', name: 'Student Create', code: 'students:create', module: 'students', action: 'create', isSystem: true },
  { id: '6', name: 'Student Read', code: 'students:read', module: 'students', action: 'read', isSystem: true },
  { id: '7', name: 'Student Update', code: 'students:update', module: 'students', action: 'update', isSystem: true },
  { id: '8', name: 'Student Delete', code: 'students:delete', module: 'students', action: 'delete', isSystem: true },
  { id: '9', name: 'Class Create', code: 'classes:create', module: 'classes', action: 'create', isSystem: true },
  { id: '10', name: 'Class Read', code: 'classes:read', module: 'classes', action: 'read', isSystem: true },
  { id: '11', name: 'Class Update', code: 'classes:update', module: 'classes', action: 'update', isSystem: true },
  { id: '12', name: 'Class Delete', code: 'classes:delete', module: 'classes', action: 'delete', isSystem: true },
  { id: '13', name: 'Audit Logs Read', code: 'audit_logs:read', module: 'audit_logs', action: 'read', isSystem: true },
  { id: '14', name: 'System Manage', code: 'system:manage', module: 'system', action: 'manage', isSystem: true },
];

const mockUserRoles = [
  { id: '1', userId: 'user1', userName: 'John Admin', userEmail: 'john@example.com', roleName: 'Administrator', assignedAt: '2024-01-15' },
  { id: '2', userId: 'user2', userName: 'Jane Faculty', userEmail: 'jane@example.com', roleName: 'Faculty', assignedAt: '2024-01-20' },
  { id: '3', userId: 'user3', userName: 'Bob Student', userEmail: 'bob@example.com', roleName: 'Student', assignedAt: '2024-02-01' },
];

const PermissionsManagementPage = () => {
  const { userPermissions, isAdmin, isSuperAdmin } = useRBACPermissions();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search
  const filteredRoles = mockRoles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermissions = mockPermissions.filter(permission => 
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserRoles = mockUserRoles.filter(userRole => 
    userRole.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userRole.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockRoles.length}</div>
              <p className="text-xs text-muted-foreground">
                {mockRoles.filter(r => r.isSystem).length} system roles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPermissions.length}</div>
              <p className="text-xs text-muted-foreground">
                {new Set(mockPermissions.map(p => p.module)).size} modules
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
                {mockRoles.reduce((acc, role) => acc + role.userCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all roles
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roles">Roles</TabsTrigger>
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
                  <RBACPermissionGuard permissions="roles:create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>
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
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{role.name}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{role.code}</Badge>
                        </TableCell>
                        <TableCell>{role.level}</TableCell>
                        <TableCell>{role.userCount}</TableCell>
                        <TableCell>{role.permissionCount}</TableCell>
                        <TableCell>
                          <Badge variant={role.isActive ? "default" : "secondary"}>
                            {role.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <RBACPermissionGuard permissions="roles:read">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </RBACPermissionGuard>
                            <RBACPermissionGuard permissions="roles:update">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </RBACPermissionGuard>
                            <RBACPermissionGuard permissions="roles:delete">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                disabled={role.isSystem}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </RBACPermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
                  <RBACPermissionGuard permissions="permissions:create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Permission
                    </Button>
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
                    {filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {permission.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{permission.module}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{permission.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={permission.isSystem ? "default" : "outline"}>
                            {permission.isSystem ? "System" : "Custom"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <RBACPermissionGuard permissions="permissions:read">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </RBACPermissionGuard>
                            <RBACPermissionGuard permissions="permissions:update">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </RBACPermissionGuard>
                            <RBACPermissionGuard permissions="permissions:delete">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={permission.isSystem}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </RBACPermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                  <RBACPermissionGuard permissions="user_roles:create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Assign Role
                    </Button>
                  </RBACPermissionGuard>
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
                    {filteredUserRoles.map((userRole) => (
                      <TableRow key={userRole.id}>
                        <TableCell className="font-medium">{userRole.userName}</TableCell>
                        <TableCell>{userRole.userEmail}</TableCell>
                        <TableCell>
                          <Badge>{userRole.roleName}</Badge>
                        </TableCell>
                        <TableCell>{userRole.assignedAt}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <RBACPermissionGuard permissions="user_roles:update">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </RBACPermissionGuard>
                            <RBACPermissionGuard permissions="user_roles:delete">
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </RBACPermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
      </div>
    </AdminOnlyGuard>
  );
};

export default PermissionsManagementPage;