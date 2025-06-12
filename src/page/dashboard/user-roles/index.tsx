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

// Mock data - replace with actual API calls
const mockUsers = [
  {
    id: '1',
    name: 'John Super Admin',
    email: 'john@example.com',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-06-12T14:30:00Z',
    roles: [
      {
        id: 'role1',
        name: 'Super Administrator',
        code: 'super_admin',
        level: 1,
        assignedAt: '2024-01-15T10:00:00Z',
        assignedBy: 'System',
        isActive: true,
        expiresAt: null,
        context: null
      }
    ]
  },
  {
    id: '2',
    name: 'Jane Admin',
    email: 'jane@example.com',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-20T09:00:00Z',
    lastLogin: '2024-06-12T12:15:00Z',
    roles: [
      {
        id: 'role2',
        name: 'Administrator',
        code: 'admin',
        level: 2,
        assignedAt: '2024-01-20T09:00:00Z',
        assignedBy: 'John Super Admin',
        isActive: true,
        expiresAt: null,
        context: null
      }
    ]
  },
  {
    id: '3',
    name: 'Bob Faculty',
    email: 'bob@example.com',
    avatar: null,
    isActive: true,
    createdAt: '2024-02-01T11:00:00Z',
    lastLogin: '2024-06-12T08:45:00Z',
    roles: [
      {
        id: 'role3',
        name: 'Faculty Member',
        code: 'faculty',
        level: 3,
        assignedAt: '2024-02-01T11:00:00Z',
        assignedBy: 'John Super Admin',
        isActive: true,
        expiresAt: null,
        context: null
      }
    ]
  },
  {
    id: '4',
    name: 'Alice Student',
    email: 'alice@example.com',
    avatar: null,
    isActive: true,
    createdAt: '2024-02-15T13:00:00Z',
    lastLogin: '2024-06-12T16:20:00Z',
    roles: [
      {
        id: 'role4',
        name: 'Student',
        code: 'student',
        level: 4,
        assignedAt: '2024-02-15T13:00:00Z',
        assignedBy: 'Jane Admin',
        isActive: true,
        expiresAt: null,
        context: null
      }
    ]
  },
  {
    id: '5',
    name: 'Mike No Role',
    email: 'mike@example.com',
    avatar: null,
    isActive: true,
    createdAt: '2024-03-01T15:00:00Z',
    lastLogin: '2024-06-10T10:30:00Z',
    roles: []
  }
];

const mockRoles = [
  {
    id: 'role1',
    name: 'Super Administrator',
    code: 'super_admin',
    description: 'Complete system access with all permissions',
    level: 1,
    userCount: 1,
    permissionCount: 50,
    isSystem: true,
    isActive: true,
    permissions: [
      'system:manage', 'users:manage', 'students:manage', 'classes:manage', 
      'roles:manage', 'permissions:manage', 'audit_logs:read'
    ]
  },
  {
    id: 'role2',
    name: 'Administrator',
    code: 'admin',
    description: 'Administrative access for daily operations',
    level: 2,
    userCount: 1,
    permissionCount: 35,
    isSystem: true,
    isActive: true,
    permissions: [
      'users:create', 'users:read', 'users:update', 'users:delete',
      'students:create', 'students:read', 'students:update', 'students:delete',
      'classes:create', 'classes:read', 'classes:update', 'classes:delete'
    ]
  },
  {
    id: 'role3',
    name: 'Faculty Member',
    code: 'faculty',
    description: 'Teaching staff with student and class management',
    level: 3,
    userCount: 1,
    permissionCount: 20,
    isSystem: true,
    isActive: true,
    permissions: [
      'students:read', 'students:update', 'classes:read', 'classes:update',
      'attendance:create', 'attendance:read', 'attendance:update'
    ]
  },
  {
    id: 'role4',
    name: 'Student',
    code: 'student',
    description: 'Student access to view their own information',
    level: 4,
    userCount: 1,
    permissionCount: 8,
    isSystem: true,
    isActive: true,
    permissions: [
      'profile:read', 'profile:update', 'grades:read', 'attendance:read'
    ]
  }
];

const allPermissions = [
  { id: '1', name: 'System Manage', code: 'system:manage', module: 'system', action: 'manage' },
  { id: '2', name: 'User Create', code: 'users:create', module: 'users', action: 'create' },
  { id: '3', name: 'User Read', code: 'users:read', module: 'users', action: 'read' },
  { id: '4', name: 'User Update', code: 'users:update', module: 'users', action: 'update' },
  { id: '5', name: 'User Delete', code: 'users:delete', module: 'users', action: 'delete' },
  { id: '6', name: 'User Manage', code: 'users:manage', module: 'users', action: 'manage' },
  { id: '7', name: 'Student Create', code: 'students:create', module: 'students', action: 'create' },
  { id: '8', name: 'Student Read', code: 'students:read', module: 'students', action: 'read' },
  { id: '9', name: 'Student Update', code: 'students:update', module: 'students', action: 'update' },
  { id: '10', name: 'Student Delete', code: 'students:delete', module: 'students', action: 'delete' },
  { id: '11', name: 'Student Manage', code: 'students:manage', module: 'students', action: 'manage' },
  { id: '12', name: 'Class Create', code: 'classes:create', module: 'classes', action: 'create' },
  { id: '13', name: 'Class Read', code: 'classes:read', module: 'classes', action: 'read' },
  { id: '14', name: 'Class Update', code: 'classes:update', module: 'classes', action: 'update' },
  { id: '15', name: 'Class Delete', code: 'classes:delete', module: 'classes', action: 'delete' },
  { id: '16', name: 'Class Manage', code: 'classes:manage', module: 'classes', action: 'manage' },
  { id: '17', name: 'Role Create', code: 'roles:create', module: 'roles', action: 'create' },
  { id: '18', name: 'Role Read', code: 'roles:read', module: 'roles', action: 'read' },
  { id: '19', name: 'Role Update', code: 'roles:update', module: 'roles', action: 'update' },
  { id: '20', name: 'Role Delete', code: 'roles:delete', module: 'roles', action: 'delete' },
  { id: '21', name: 'Permission Create', code: 'permissions:create', module: 'permissions', action: 'create' },
  { id: '22', name: 'Permission Read', code: 'permissions:read', module: 'permissions', action: 'read' },
  { id: '23', name: 'Permission Update', code: 'permissions:update', module: 'permissions', action: 'update' },
  { id: '24', name: 'Permission Delete', code: 'permissions:delete', module: 'permissions', action: 'delete' },
  { id: '25', name: 'Audit Logs Read', code: 'audit_logs:read', module: 'audit_logs', action: 'read' },
];

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

  const { toast } = useToast();
  const { isSuperAdmin } = useRBACPermissions();
  
  // API hooks
  const { data: rolesData } = useRoles();
  const { data: permissionsData } = usePermissions();
  const { data: userRolesData } = useUserRoles();
  const { data: userRoleStats } = useUserRoleStats();
  const { data: roleStats } = useRoleStats();
  const assignRoleMutation = useAssignRole();
  const removeRoleMutation = useRemoveRole();
  
  // Get data from API or fallback to mock data
  const roles = rolesData?.data || mockRoles;
  const permissions = permissionsData?.data || allPermissions;
  const userRoles = userRolesData?.data || [];
  
  // Transform user roles data to match our UI structure
  const users = mockUsers; // Still using mock users for now since we need user service

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
      userId: selectedUser.id,
      roleId: selectedRole,
      customPermissions: customPermissions.length > 0 ? customPermissions : undefined,
      deniedPermissions: deniedPermissions.length > 0 ? deniedPermissions : undefined,
      expiresAt: expirationDate || undefined,
    }, {
      onSuccess: () => {
        setAssignRoleDialogOpen(false);
        setSelectedUser(null);
        setSelectedRole('');
        setCustomPermissions([]);
        setDeniedPermissions([]);
        setExpirationDate('');
      }
    });
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
              <div className="text-2xl font-bold">{mockUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                {mockUsers.filter(u => u.isActive).length} active
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
                {userRoleStats?.usersWithRoles || mockUsers.filter(u => u.roles.length > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {userRoleStats?.usersWithoutRoles || mockUsers.filter(u => u.roles.length === 0).length} unassigned
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || undefined} alt={user.name} />
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
                            {user.roles.length > 0 ? (
                              user.roles.map((role, index) => (
                                <Badge 
                                  key={index} 
                                  className={getRoleLevelColor(role.level)}
                                >
                                  {getRoleIcon(role.level)}
                                  <span className="ml-1">{role.name}</span>
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                No roles assigned
                              </Badge>
                            )}
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role Overview Tab */}
          <TabsContent value="roles">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {roles.map((role) => (
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
              ))}
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
                  {Object.entries(groupedPermissions).map(([module, permissions]) => (
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
                  ))}
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
                    const user = mockUsers.find(u => u.id === value);
                    setSelectedUser(user);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center space-x-2">
                            <span>{user.name}</span>
                            <span className="text-gray-500">({user.email})</span>
                          </div>
                        </SelectItem>
                      ))}
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
                    {mockRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
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
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`custom-${permission.id}`}
                              checked={customPermissions.includes(permission.code)}
                              onCheckedChange={() => handlePermissionToggle(permission.code, 'custom')}
                            />
                            <Label 
                              htmlFor={`custom-${permission.id}`}
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
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`denied-${permission.id}`}
                              checked={deniedPermissions.includes(permission.code)}
                              onCheckedChange={() => handlePermissionToggle(permission.code, 'denied')}
                            />
                            <Label 
                              htmlFor={`denied-${permission.id}`}
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
      </div>
    </RBACPermissionGuard>
  );
}

export default UserRoleAssignmentPage;