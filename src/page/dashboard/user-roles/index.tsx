import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { RBACPermissionGuard } from '@/components/resuable/permission-guard';
import { useRBACPermissions } from '@/hooks/use-permissions';
import { 
  Users, 
  Shield, 
  Crown, 
  UserPlus, 
  Settings, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useRoles, usePermissions, useUserRoles, useAssignRole, useRemoveRole, useUserRoleStats, useRoleStats } from '@/hooks/api/use-rbac';
import { useAuth } from '@/hooks/api/use-auth';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/services/user.service';
import EditUserRoleDialog from './components/edit-user-role-dialog';

// All data now comes from the database via API calls

function UserRoleAssignmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [deniedPermissions, setDeniedPermissions] = useState<string[]>([]);
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState('assignments');
  const [editUserRoleOpen, setEditUserRoleOpen] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<any>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<any>(null);

  const { toast } = useToast();
  const { isSuperAdmin } = useRBACPermissions();
  
  // API hooks
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRoles();
  const { data: permissionsData, isLoading: permissionsLoading, error: permissionsError } = usePermissions();
  const { data: userRolesData, isLoading: userRolesLoading, error: userRolesError } = useUserRoles();
  const { data: userRoleStats } = useUserRoleStats();
  const { data: roleStats } = useRoleStats();
  const assignRoleMutation = useAssignRole();
  const removeRoleMutation = useRemoveRole();
  
  // Fetch users data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getAllUsers({ limit: 1000 }), // Get all users for role assignment
  });
  
  // Get data from API
  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];
  const userRoles = userRolesData?.data || [];
  const users = usersData?.data || [];

  // Log API data status for debugging
  React.useEffect(() => {
    console.log('User Roles Page Data Status:', {
      users: users.length,
      roles: roles.length,
      permissions: permissions.length,
      userRoles: userRoles.length,
      loading: { users: usersLoading, roles: rolesLoading, permissions: permissionsLoading, userRoles: userRolesLoading }
    });
  }, [users.length, roles.length, permissions.length, userRoles.length, usersLoading, rolesLoading, permissionsLoading, userRolesLoading]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return users.filter((user: any) => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Get role level color
  const getRoleLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-blue-100 text-blue-800';
      case 4: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get role icon
  const getRoleIcon = (level: number) => {
    switch (level) {
      case 1: return <Crown className="w-4 h-4" />;
      case 2: return <Shield className="w-4 h-4" />;
      case 3: return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  // Handle role assignment
  const handleAssignRole = () => {
    if (!selectedUser || !selectedRole) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a user and role.",
      });
      return;
    }

    assignRoleMutation.mutate({
      userId: selectedUser._id || selectedUser.id,
      roleId: selectedRole,
      customPermissions: customPermissions.length > 0 ? customPermissions : undefined,
      deniedPermissions: deniedPermissions.length > 0 ? deniedPermissions : undefined,
      expiresAt: expirationDate ? new Date(expirationDate).toISOString() : undefined,
    }, {
      onSuccess: () => {
        setAssignRoleDialogOpen(false);
        setSelectedUser(null);
        setSelectedRole('');
        setCustomPermissions([]);
        setDeniedPermissions([]);
        setExpirationDate('');
        toast({
          title: "Role Assigned",
          description: `Successfully assigned ${roles.find(r => r._id === selectedRole)?.name} to ${selectedUser?.name}`,
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Assignment Failed",
          description: error.response?.data?.message || "Failed to assign role to user.",
        });
      }
    });
  };

  // Handle role removal
  const handleRemoveRole = (userRoleId: string, userName: string, roleName: string) => {
    removeRoleMutation.mutate(userRoleId, {
      onSuccess: () => {
        toast({
          title: "Role Removed",
          description: `Successfully removed ${roleName} from ${userName}`,
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Removal Failed",
          description: error.response?.data?.message || "Failed to remove role from user.",
        });
      }
    });
  };

  // Handle edit user role
  const handleEditUserRole = (userRole: any, user: any, role: any) => {
    setSelectedUserRole(userRole);
    setSelectedUserForEdit(user);
    setSelectedRoleForEdit(role);
    setEditUserRoleOpen(true);
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionCode: string, type: 'custom' | 'denied') => {
    if (type === 'custom') {
      setCustomPermissions(prev => 
        prev.includes(permissionCode)
          ? prev.filter(p => p !== permissionCode)
          : [...prev, permissionCode]
      );
    } else {
      setDeniedPermissions(prev => 
        prev.includes(permissionCode)
          ? prev.filter(p => p !== permissionCode)
          : [...prev, permissionCode]
      );
    }
  };

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const grouped = permissions.reduce((acc, permission) => {
      const module = permission.module || 'other';
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);
    return grouped;
  }, [permissions]);

  return (
    <RBACPermissionGuard 
      permissions="system:manage"
      fallback={
        <div className="flex items-center justify-center h-64">
          <Card className="p-6">
            <CardContent className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Super Admin Access Required</h3>
              <p className="text-gray-600">Only super administrators can access user role management.</p>
              <p className="text-sm text-gray-500 mt-2">Required permission: system:manage</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Role Assignment</h1>
            <p className="text-muted-foreground">
              Assign roles and permissions to users across the system
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-red-50">
              <Crown className="w-3 h-3 mr-1" />
              Super Admin Only
            </Badge>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usersLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  users.length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {usersLoading ? (
                  <div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `${users.filter((u: any) => u.isActive).length} active`
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users with Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userRoleStats?.usersWithRoles || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {userRoleStats?.usersWithoutRoles || 0} unassigned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Roles</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats?.totalRoles || roles.length}</div>
              <p className="text-xs text-muted-foreground">
                {roleStats?.systemRoles || roles.filter(r => r.isSystem).length} system roles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permissions.length}</div>
              <p className="text-xs text-muted-foreground">
                {new Set(permissions.map(p => p.module)).size} modules
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            onClick={() => setAssignRoleDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Role
          </Button>
        </div>

        {/* Error Display */}
        {(rolesError || permissionsError || userRolesError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-red-800 font-medium">Error Loading Data</h3>
            </div>
            <div className="mt-2 text-red-700 text-sm">
              {rolesError && <p>Roles: {(rolesError as any).message}</p>}
              {permissionsError && <p>Permissions: {(permissionsError as any).message}</p>}
              {userRolesError && <p>User Roles: {(userRolesError as any).message}</p>}
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">User Assignments</TabsTrigger>
            <TabsTrigger value="roles">Role Overview</TabsTrigger>
            <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
          </TabsList>

          {/* User Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>User Role Assignments</CardTitle>
                <CardDescription>
                  Manage which roles are assigned to each user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Current Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="h-4 w-4 bg-gray-300 animate-pulse rounded"></div>
                            <span>Loading users...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {searchTerm ? 'No users found matching your search' : 'No users found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user?._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.avatar || undefined} alt={user.name} />
                              <AvatarFallback>
                                {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              const userRoleAssignments = userRoles.filter((ur: any) => {
                                // Handle both populated and non-populated userId
                                const userId = typeof ur.userId === 'object' ? ur.userId._id : ur.userId;
                                return userId === user._id;
                              });
                              return userRoleAssignments.length > 0 ? (
                                userRoleAssignments.map((userRole: any) => {
                                  // Handle both populated and non-populated roleId
                                  const role = typeof userRole.roleId === 'object' 
                                    ? userRole.roleId 
                                    : roles.find(r => r._id === userRole.roleId);
                                  if (!role) return null;
                                  return (
                                    <div key={userRole._id} className="flex items-center gap-1">
                                      <Badge 
                                        className={getRoleLevelColor(role.level)}
                                      >
                                        {getRoleIcon(role.level)}
                                        <span className="ml-1">{role.name}</span>
                                      </Badge>
                                      <div className="flex space-x-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                                          onClick={() => handleEditUserRole(userRole, user, role)}
                                          title="Edit role assignment"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                          onClick={() => handleRemoveRole(userRole._id, user.name, role.name)}
                                          title="Remove role"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <Badge variant="outline" className="text-gray-500">
                                  No roles assigned
                                </Badge>
                              );
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm') : 'Never'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setAssignRoleDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
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

          {/* Role Overview Tab */}
          <TabsContent value="roles">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {rolesLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 bg-gray-300 animate-pulse rounded"></div>
                          <div className="h-5 w-24 bg-gray-300 animate-pulse rounded"></div>
                        </div>
                        <div className="h-5 w-16 bg-gray-300 animate-pulse rounded"></div>
                      </div>
                      <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-3 w-full bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-3 w-full bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-3 w-3/4 bg-gray-300 animate-pulse rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : roles.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">No roles found</p>
                </div>
              ) : (
                roles.map((role) => (
                <Card key={role._id || role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role.level)}
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                      </div>
                      <Badge className={getRoleLevelColor(role.level)}>
                        Level {role.level}
                      </Badge>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Users assigned:</span>
                        <span className="font-medium">{role.userCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Permissions:</span>
                        <span className="font-medium">{role.permissions?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <Badge variant={role.isSystem ? "default" : "outline"}>
                          {role.isSystem ? "System" : "Custom"}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Key Permissions:</h4>
                        <div className="flex flex-wrap gap-1">
                          {(role.permissions || []).slice(0, 4).map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {typeof permission === 'string' ? permission : permission.code || permission.name}
                            </Badge>
                          ))}
                          {(role.permissions || []).length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{(role.permissions || []).length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Permission Matrix Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>
                  Overview of all permissions organized by module
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {permissionsLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <div key={index}>
                        <div className="h-6 w-32 bg-gray-300 animate-pulse rounded mb-3"></div>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-12 bg-gray-300 animate-pulse rounded"></div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : Object.keys(groupedPermissions).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No permissions found</p>
                    </div>
                  ) : (
                    Object.entries(groupedPermissions).map(([module, permissions]) => (
                    <div key={module}>
                      <h3 className="text-lg font-semibold mb-3 capitalize">{module} Module</h3>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                            <Badge variant="outline" className="text-xs">
                              {permission.action}
                            </Badge>
                            <span className="text-sm">{permission.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assign Role Dialog */}
        <Dialog open={assignRoleDialogOpen} onOpenChange={setAssignRoleDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? `Assign Role to ${selectedUser.name}` : 'Assign Role to User'}
              </DialogTitle>
              <DialogDescription>
                Select a role and configure additional permissions for the user.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* User Selection */}
              {!selectedUser && (
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select onValueChange={(value) => {
                    const user = users.find((u: any) => u._id === value);
                    setSelectedUser(user);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={usersLoading ? "Loading users..." : "Choose a user"} />
                    </SelectTrigger>
                    <SelectContent>
                      {usersLoading ? (
                        <SelectItem value="loading" disabled>Loading users...</SelectItem>
                      ) : users.length === 0 ? (
                        <SelectItem value="no-users" disabled>No users found</SelectItem>
                      ) : (
                        users.map((user: any) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Select Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: any) => (
                      <SelectItem key={role._id} value={role._id}>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(role.level)}
                          <span>{role.name}</span>
                          <Badge className={getRoleLevelColor(role.level)}>
                            Level {role.level}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expiration Date */}
              <div className="space-y-2">
                <Label>Expiration Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Leave empty for permanent assignment
                </p>
              </div>

              {/* Custom Permissions */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Additional Permissions</Label>
                  <p className="text-sm text-gray-500">
                    Grant extra permissions beyond the role's default permissions
                  </p>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {Object.entries(groupedPermissions).map(([module, permissions]) => (
                    <div key={module}>
                      <h4 className="font-medium mb-2 capitalize">{module}</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {permissions.map((permission) => (
                          <div key={(permission as any)._id || (permission as any).id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`custom-${(permission as any)._id || (permission as any).id}`}
                              checked={customPermissions.includes(permission.code)}
                              onCheckedChange={() => handlePermissionToggle(permission.code, 'custom')}
                            />
                            <Label 
                              htmlFor={`custom-${(permission as any)._id || (permission as any).id}`}
                              className="text-sm cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Denied Permissions */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Denied Permissions</Label>
                  <p className="text-sm text-gray-500">
                    Explicitly deny specific permissions even if granted by the role
                  </p>
                </div>

                <div className="space-y-4 max-h-40 overflow-y-auto border rounded-lg p-4">
                  {Object.entries(groupedPermissions).map(([module, permissions]) => (
                    <div key={module}>
                      <h4 className="font-medium mb-2 capitalize">{module}</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {permissions.map((permission) => (
                          <div key={(permission as any)._id || (permission as any).id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`denied-${(permission as any)._id || (permission as any).id}`}
                              checked={deniedPermissions.includes(permission.code)}
                              onCheckedChange={() => handlePermissionToggle(permission.code, 'denied')}
                            />
                            <Label 
                              htmlFor={`denied-${(permission as any)._id || (permission as any).id}`}
                              className="text-sm cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setAssignRoleDialogOpen(false);
                  setSelectedUser(null);
                  setSelectedRole('');
                  setCustomPermissions([]);
                  setDeniedPermissions([]);
                  setExpirationDate('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignRole}>
                Assign Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Role Dialog */}
        <EditUserRoleDialog
          userRole={selectedUserRole}
          user={selectedUserForEdit}
          role={selectedRoleForEdit}
          open={editUserRoleOpen}
          onOpenChange={setEditUserRoleOpen}
        />
      </div>
    </RBACPermissionGuard>
  );
}

export default UserRoleAssignmentPage;