import { RBACPermissionGuard } from '@/components/resuable/permission-guard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useDeleteRole, useRoles } from '@/hooks/api/use-rbac';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Crown,
  Edit,
  Eye,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  Users
} from 'lucide-react';
import { useState } from 'react';
import CreateRoleDialog from './create-role-dialog';
import EditRoleDialog from './edit-role-dialog';

export default function RolesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  
  const { toast } = useToast();
  const { data: rolesData, isLoading, error } = useRoles();
  const deleteRoleMutation = useDeleteRole();
  
  const roles = rolesData?.data || [];

  // Filter roles based on search
  const filteredRoles = roles.filter((role: any) => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get role level info
  const getRoleLevelInfo = (level: number) => {
    switch (level) {
      case 1: return { icon: Crown, color: 'text-red-600 bg-red-100', label: 'Super Admin' };
      case 2: return { icon: Shield, color: 'text-orange-600 bg-orange-100', label: 'Admin' };
      case 3: return { icon: Users, color: 'text-blue-600 bg-blue-100', label: 'Manager' };
      case 4: return { icon: Users, color: 'text-green-600 bg-green-100', label: 'User' };
      default: return { icon: Users, color: 'text-gray-600 bg-gray-100', label: 'Custom' };
    }
  };

  // Handle role actions
  const handleEdit = (role: any) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const handleDelete = (role: any) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleDuplicate = (role: any) => {
    setSelectedRole({
      ...role,
      name: `${role.name} (Copy)`,
      code: `${role.code}_copy`,
      isSystem: false, // Duplicated roles are never system roles
    });
    // setCreateDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRole) {
      deleteRoleMutation.mutate(selectedRole._id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedRole(null);
          toast({
            title: 'Role Deleted',
            description: `Successfully deleted role: ${selectedRole.name}`,
          });
        },
        onError: (error: any) => {
          toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.response?.data?.message || 'Failed to delete role',
          });
        },
      });
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Roles Management</h2>
          <p className="text-muted-foreground">
            Create and manage user roles with specific permission sets
          </p>
        </div>
        <RBACPermissionGuard permissions="role:create">
          <CreateRoleDialog />
        </RBACPermissionGuard>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-red-800 font-medium">Error Loading Roles</h3>
          </div>
          <p className="text-red-700 text-sm mt-1">{(error as any).message}</p>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Roles</CardTitle>
              <CardDescription>
                Manage system and custom roles with granular permissions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gray-300 animate-pulse rounded"></div>
                        <div>
                          <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                          <div className="h-3 w-32 bg-gray-300 animate-pulse rounded mt-1"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-12 bg-gray-300 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-8 bg-gray-300 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-8 bg-gray-300 animate-pulse rounded"></div></TableCell>
                  </TableRow>
                ))
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {searchTerm ? 'No roles found matching your search' : 'No roles found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role: any) => {
                  const levelInfo = getRoleLevelInfo(role.level);
                  const Icon = levelInfo.icon;
                  
                  return (
                    <TableRow key={role._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${levelInfo.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">{role.name}</div>
                            {role.description && (
                              <div className="text-sm text-gray-500 max-w-48 truncate">
                                {role.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {role.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{role.level}</span>
                          <Badge variant="secondary" className="text-xs">
                            {levelInfo.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role.permissions?.length || 0} permissions
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {role.isActive ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={role.isActive ? "default" : "secondary"}>
                            {role.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.isSystem ? "default" : "outline"}>
                          {role.isSystem ? "System" : "Custom"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <RBACPermissionGuard permissions="role:read">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </RBACPermissionGuard>
                            <RBACPermissionGuard permissions="role:update">
                              <DropdownMenuItem onClick={() => handleEdit(role)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                            </RBACPermissionGuard>
                            <RBACPermissionGuard permissions="role:create">
                              <DropdownMenuItem onClick={() => handleDuplicate(role)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                            </RBACPermissionGuard>
                            <DropdownMenuSeparator />
                            <RBACPermissionGuard permissions="role:delete">
                              <DropdownMenuItem 
                                onClick={() => handleDelete(role)}
                                disabled={role.isSystem}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {role.isSystem ? 'Cannot Delete' : 'Delete Role'}
                              </DropdownMenuItem>
                            </RBACPermissionGuard>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Role Dialog */}

      {/* Edit Role Dialog */}
      <EditRoleDialog
        role={selectedRole}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedRole(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{selectedRole?.name}"? 
              This action cannot be undone and will remove all role assignments.
              {selectedRole?.isSystem && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                  ⚠️ This is a system role and cannot be deleted.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={selectedRole?.isSystem || deleteRoleMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}