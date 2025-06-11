import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table/data-table";
import { toast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useClassDialog } from "@/hooks/use-class-dialog";
import { classService } from "@/services/class.service";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Loader2,
  RefreshCw,
  BookOpen,
  Users,
  GraduationCap,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import AddClassDialog from "./components/add-class-dialog";
import EditClassDialog from "./components/edit-class-dialog";
import ViewClassDialog from "./components/view-class-dialog";
import { createColumns } from "./data/columns";
import { Class } from "./data/schema";

export default function ClassesPage() {
  // State for filtering and pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryClient = useQueryClient();
  const { onOpenAdd, onOpenEdit, onOpenView } = useClassDialog();
  const { confirm } = useConfirmDialog();

  // Fetch classes with pagination
  const {
    data: classesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["classes", { page, limit, search, isActive: statusFilter }],
    queryFn: () =>
      classService.getClasses({
        page,
        limit,
        search: search || undefined,
        isActive: statusFilter as "all" | "true" | "false",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    placeholderData: keepPreviousData,
  });

  // Fetch class statistics
  const { data: stats } = useQuery({
    queryKey: ["class-stats"],
    queryFn: classService.getClassStats,
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => classService.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class-stats"] });
      toast({
        title: "Class Deleted",
        description: "Class has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete class",
      });
    },
  });

  // Action handlers
  const handleView = (classData: Class) => {
    onOpenView(classData);
  };

  const handleEdit = (classData: Class) => {
    onOpenEdit(classData);
  };

  const handleDelete = async (classData: Class) => {
    const confirmed = await confirm({
      title: "Delete Class",
      description: `Are you sure you want to delete "${classData.name}"? This action will deactivate the class and it can be reactivated later.`,
      confirmText: "Delete",
      variant: "destructive",
    });

    if (confirmed) {
      deleteClassMutation.mutate({ id: classData._id });
    }
  };

  // Create columns with action handlers
  const columns = useMemo(
    () =>
      createColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
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

  const classes = classesData?.data || [];
  const totalPages = classesData?.pagination.totalPages || 0;
  const total = classesData?.pagination.totalCount || 0;
  const statsData = stats?.data;

  return (
    <>
      <div className="w-full h-full flex-col space-y-8 pt-3">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Classes Management
            </h2>
            <p className="text-muted-foreground">
              Manage classes, sections, and student enrollments
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              onClick={onOpenAdd}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
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
          </div>
        </div>

        {/* Stats Cards */}
        <div>
          {statsData && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Classes
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.totalClasses}</div>
                  <p className="text-xs text-muted-foreground">
                    {statsData.activeClasses} active, {statsData.inactiveClasses} inactive
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {statsData.totalCapacity} capacity
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Class Size
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(statsData.averageClassSize)}</div>
                  <p className="text-xs text-muted-foreground">
                    Students per class
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Utilization
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.utilizationPercentage}%</div>
                  <p className="text-xs text-muted-foreground">
                    Capacity utilization
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Classes Table */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading classes...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-destructive">Failed to load classes</p>
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
              data={classes as unknown as Class[]}
              columns={columns}
              statuses={[
                {
                  label: "All Classes",
                  value: "all",
                },
                {
                  label: "Active",
                  value: "true",
                },
                {
                  label: "Inactive",
                  value: "false",
                },
              ]}
              searchColumn="name"
              searchPlaceholder="Search classes..."
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

        {/* Modals */}
        <AddClassDialog />
        <EditClassDialog />
        <ViewClassDialog />
      </div>
    </>
  );
}