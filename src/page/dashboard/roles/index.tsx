import { RBACPermissionGuard } from '@/components/resuable/permission-guard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import RolesManagement from '../permissions/components/roles-management';

function RolesPage() {
  return (
    <RBACPermissionGuard 
      permissions={["role:read", "role:create", "role:update"]}
      requireAll={false}
      fallback={
        <div className="flex items-center justify-center h-64">
          <Card className="p-6">
            <CardContent className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-gray-600">You don't have permission to access role management.</p>
              <p className="text-sm text-gray-500 mt-2">Required permissions: role:read, role:create, or role:update</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage user roles with specific permission sets. Control access levels and system privileges.
          </p>
        </div>

        {/* Roles Management Component */}
        <RolesManagement />
      </div>
    </RBACPermissionGuard>
  );
}

export default RolesPage;