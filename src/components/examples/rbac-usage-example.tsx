import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RBACPermissionGuard, 
  AdminOnlyGuard, 
  FacultyGuard,
  CreatePermissionGuard,
  UpdatePermissionGuard,
  DeletePermissionGuard
} from "@/components/resuable/permission-guard";
import { 
  PermissionButton, 
  CreateButton, 
  EditButton, 
  DeleteButton, 
  AdminButton,
  FacultyButton
} from "@/components/resuable/permission-button";
import { useRBACPermissions } from "@/hooks/use-permissions";

// Example component showing all RBAC usage patterns
const RBACUsageExample: React.FC = () => {
  const { userPermissions, hasPermission, isAdmin, isFaculty, isAuthenticated } = useRBACPermissions();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>RBAC System - Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* User Info Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current User Info</h3>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Is Admin: {isAdmin() ? 'Yes' : 'No'}</p>
            <p>Is Faculty: {isFaculty() ? 'Yes' : 'No'}</p>
            <p>Total Permissions: {userPermissions.permissions.length}</p>
            <p>Total Roles: {userPermissions.roles.length}</p>
          </div>

          {/* Permission Guards Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Permission Guards (Conditional Rendering)</h3>
            
            {/* Basic permission check */}
            <RBACPermissionGuard permissions="user:create">
              <div className="bg-green-100 p-3 rounded">
                ✅ You can see this because you have 'user:create' permission
              </div>
            </RBACPermissionGuard>

            {/* Multiple permissions (ANY) */}
            <RBACPermissionGuard permissions={["user:create", "student:create"]}>
              <div className="bg-green-100 p-3 rounded">
                ✅ You can see this because you have ANY of: user:create OR student:create
              </div>
            </RBACPermissionGuard>

            {/* Multiple permissions (ALL) */}
            <RBACPermissionGuard permissions={["user:read", "user:update"]} requireAll>
              <div className="bg-green-100 p-3 rounded">
                ✅ You can see this because you have ALL of: user:read AND user:update
              </div>
            </RBACPermissionGuard>

            {/* Role-based access */}
            <AdminOnlyGuard>
              <div className="bg-purple-100 p-3 rounded">
                ✅ Admin Only Content - Only super_admin and admin can see this
              </div>
            </AdminOnlyGuard>

            <FacultyGuard>
              <div className="bg-blue-100 p-3 rounded">
                ✅ Faculty+ Content - Faculty, admin, and super_admin can see this
              </div>
            </FacultyGuard>

            {/* With custom fallback */}
            <RBACPermissionGuard 
              permissions="system:manage" 
              fallback={<div className="bg-red-100 p-3 rounded">❌ You need system:manage permission</div>}
            >
              <div className="bg-green-100 p-3 rounded">
                ✅ Super Admin Only - System management content
              </div>
            </RBACPermissionGuard>
          </div>

          {/* Permission Buttons Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">2. Permission Buttons</h3>
            
            <div className="flex gap-3 flex-wrap">
              {/* Basic permission buttons */}
              <PermissionButton permissions="user:create">
                Create User
              </PermissionButton>

              <PermissionButton permissions="user:update">
                Update User
              </PermissionButton>

              <PermissionButton permissions="user:delete" variant="destructive">
                Delete User
              </PermissionButton>

              {/* Module-specific buttons */}
              <CreateButton module="students">Create Student</CreateButton>
              <EditButton module="classes">Edit Class</EditButton>
              <DeleteButton module="projects">Delete Project</DeleteButton>

              {/* Role-based buttons */}
              <AdminButton>Admin Function</AdminButton>
              <FacultyButton variant="outline">Faculty Function</FacultyButton>

              {/* Button that hides when no access */}
              <PermissionButton 
                permissions="system:manage" 
                hideWhenNoAccess
                variant="secondary"
              >
                System Settings
              </PermissionButton>

              {/* Button that shows but disables when no access */}
              <PermissionButton 
                permissions="advanced:feature" 
                disableWhenNoAccess
                noAccessMessage="You need advanced:feature permission"
              >
                Advanced Feature
              </PermissionButton>
            </div>
          </div>

          {/* Module-specific Guards */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">3. Module-specific Permission Guards</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CreatePermissionGuard module="users">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">Create Users</h4>
                    <p className="text-sm text-gray-600">You can create new users</p>
                  </CardContent>
                </Card>
              </CreatePermissionGuard>

              <UpdatePermissionGuard module="classes">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">Edit Classes</h4>
                    <p className="text-sm text-gray-600">You can modify class information</p>
                  </CardContent>
                </Card>
              </UpdatePermissionGuard>

              <DeletePermissionGuard module="students">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">Delete Students</h4>
                    <p className="text-sm text-gray-600">You can remove student records</p>
                  </CardContent>
                </Card>
              </DeletePermissionGuard>
            </div>
          </div>

          {/* Context-aware Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">4. Context-aware Permissions</h3>
            
            <RBACPermissionGuard 
              permissions="projects:manage" 
              context={{ workspaceId: "workspace-123" }}
            >
              <div className="bg-yellow-100 p-3 rounded">
                ✅ You can manage projects in workspace-123
              </div>
            </RBACPermissionGuard>

            <PermissionButton 
              permissions="classes:update" 
              context={{ classId: "class-456" }}
            >
              Edit This Specific Class
            </PermissionButton>
          </div>

          {/* Complex Permission Logic */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">5. Complex Permission Logic</h3>
            
            {/* Custom logic using the hook */}
            <div className="bg-gray-100 p-4 rounded">
              <h4 className="font-semibold mb-2">Custom Permission Logic</h4>
              {hasPermission("user:create") && hasPermission("user:delete") ? (
                <p className="text-green-600">✅ You have full user management permissions</p>
              ) : (
                <p className="text-orange-600">⚠️ You have limited user management permissions</p>
              )}
            </div>

            {/* Multiple role levels */}
            <RBACPermissionGuard minRoleLevel={2}>
              <div className="bg-indigo-100 p-3 rounded">
                ✅ High-level access (Role level 2 or higher)
              </div>
            </RBACPermissionGuard>
          </div>

          {/* Permission List Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">6. Current User Permissions</h3>
            
            <div className="bg-gray-50 p-4 rounded max-h-40 overflow-y-auto">
              <h4 className="font-semibold mb-2">Your Permissions:</h4>
              {userPermissions.permissions.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {userPermissions.permissions.map((permission, index) => (
                    <li key={index} className="font-mono text-xs bg-white px-2 py-1 rounded">
                      {permission}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No permissions assigned</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Your Roles:</h4>
              {userPermissions.roles.length > 0 ? (
                <ul className="text-sm space-y-2">
                  {userPermissions.roles.map((role, index) => (
                    <li key={index} className="bg-white p-2 rounded">
                      <div className="font-medium">{role.roleName} ({role.roleCode})</div>
                      <div className="text-xs text-gray-500">Level: {role.level}</div>
                      {role.context && (
                        <div className="text-xs text-blue-600">
                          Context: {JSON.stringify(role.context)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No roles assigned</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RBACUsageExample;