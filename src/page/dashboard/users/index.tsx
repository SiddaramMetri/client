import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table/data-table";
import { useToast } from "@/components/ui/use-toast";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useUserDialog } from "@/hooks/use-user-dialog";
import {
  deleteUser,
  getAllUsers,
  getUserStats,
  toggleUserStatus,
} from "@/services/user.service";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Loader2,
  RefreshCw,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Shield,
} from "lucide-react";
import { useMemo, useState } from "react";
import AddUserDialog from "./components/add-user-dialog";
import EditUserDialog from "./components/edit-user-dialog";
import { createColumns } from "./data/columns";
import { User } from "./data/schema";
import CompactStatsCards from "./components/compact-stats-cards";
import { RBACPermissionGuard } from "@/components/resuable/permission-guard";
import { useRBACPermissions } from "@/hooks/use-permissions";
import { withRBACPermission } from "@/hoc/with-permission";

function UsersPage() {
  // State for filtering and pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { onOpenAdd, onOpenEdit } = useUserDialog();
  const { confirm } = useConfirmDialog();
  const { hasPermission } = useRBACPermissions();

  // Fetch users with pagination
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", { page, limit, search, status: statusFilter }],
    queryFn: () =>
      getAllUsers({
        page,
        limit,
        search: search || undefined,
        status: statusFilter as "active" | "inactive" | "all",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    placeholderData: keepPreviousData,
  });

  // Fetch user statistics
  const { data: stats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: getUserStats,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: ({ id, permanent }: { id: string; permanent?: boolean }) =>
      deleteUser(id, permanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
      });
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      toast({
        title: "Status Updated",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
      });
    },
  });

  // Action handlers with permission checks
  const handleView = (user: User) => {
    if (!hasPermission('user:read')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to view user details.",
      });
      return;
    }
    // Could open a view modal here
    console.log("View user:", user);
  };

  const handleEdit = (user: User) => {
    if (!hasPermission('user:update')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to edit users.",
      });
      return;
    }
    onOpenEdit(user);
  };

  const handleDelete = async (user: User) => {
    if (!hasPermission('user:delete')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to delete users.",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Delete User",
      description: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
    });

    if (confirmed) {
      deleteUserMutation.mutate({ id: user._id });
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!hasPermission('users:manage')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to manage user status.",
      });
      return;
    }

    const action = user.isActive ? "deactivate" : "activate";
    const confirmed = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      description: `Are you sure you want to ${action} ${user.name}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
    });

    if (confirmed) {
      toggleStatusMutation.mutate(user._id);
    }
  };

  // Create columns with action handlers
  const columns = useMemo(
    () =>
      createColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onToggleStatus: handleToggleStatus,
      }),
    []
  );

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filtering
  };

  const users = usersData?.data || [];
  const totalPages = usersData?.totalPages || 0;
  const total = usersData?.total || 0;

  return (
    <>
      <div className="w-full h-full flex-col space-y-8 pt-3">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Users Management
            </h2>
            <p className="text-muted-foreground">
              Manage user accounts, permissions, and access control
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <RBACPermissionGuard permissions="user:create">
              <Button
                size="sm"
                onClick={onOpenAdd}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </RBACPermissionGuard>
            
            <RBACPermissionGuard permissions="user:read">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </RBACPermissionGuard>
          </div>
        </div>

        <RBACPermissionGuard permissions="user:read">
          <div>
            <CompactStatsCards statsData={stats} />
          </div>
        </RBACPermissionGuard>

        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-destructive">Failed to load users</p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : (
            <DataTable
              data={users as unknown as User[]}
              columns={columns}
              statuses={[
                {
                  label: "All Users",
                  value: "all",
                },
                {
                  label: "Active",
                  value: "active",
                },
                {
                  label: "Inactive",
                  value: "inactive",
                },
              ]}
              searchColumn="name"
              searchPlaceholder="Search users..."
              // Add pagination props if your DataTable supports it
              pageCount={totalPages}
              currentPage={page}
              onPageChange={setPage}
              pageSize={limit}
              onPageSizeChange={setLimit}
              totalCount={total}
              search={search}
              handleSearchChange={handleSearchChange}
            />
          )}
        </div>
        {/* Modals - Protected by permissions */}
        <RBACPermissionGuard permissions="user:create">
          <AddUserDialog />
        </RBACPermissionGuard>
        
        <RBACPermissionGuard permissions="user:update">
          <EditUserDialog />
        </RBACPermissionGuard>
      </div>
    </>
  );
}

// Export page with RBAC protection
export default withRBACPermission(UsersPage, {
  permissions: 'user:read',
  redirectTo: '/dashboard',
  fallbackComponent: () => (
    <div className="flex items-center justify-center h-64">
      <Card className="p-6">
        <CardContent className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access user management.</p>
          <p className="text-sm text-gray-500 mt-2">Required permission: user:read</p>
        </CardContent>
      </Card>
    </div>
  )
});
