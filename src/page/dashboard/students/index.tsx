import { useState, useMemo, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Download, Upload, UserPlus, Loader2, Shield } from "lucide-react";
import { columns } from "./data/columns";
import { priorities } from "./data/priorities";
import { statuses } from "./data/statuses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "./data/schema";
import EditStudentDialog from "./components/edit-student-dialog";
import ViewStudentDialog from "./components/view-student-dialog";
import DeleteStudentDialog from "./components/delete-student-dialog";
import UploadStudentsDialog from "./components/upload-students-dialog";
import StudentRegistrationDialog from "./components/student-registration-dialog";
import AdvancedFilters, { AdvancedFilterOptions } from "./components/advanced-filters";
import { downloadStudentTemplateService } from "@/services/student.service";
import { useStudents, useStudentsStats, useToggleStudentStatus } from "@/hooks/api/use-students";
import { RBACPermissionGuard } from "@/components/resuable/permission-guard";
import { useRBACPermissions } from "@/hooks/use-permissions";
import { withRBACPermission } from "@/hoc/with-permission";

function StudentsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<AdvancedFilterOptions>({
    search: "",
  });
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Selected student for operations
  const [selectedStudent, setSelectedStudent] = useState<Task | null>(null);

  const { toast } = useToast();
  const toggleStatusMutation = useToggleStudentStatus();
  const { hasPermission } = useRBACPermissions();

  // Reset page when search term changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  // Prepare query parameters based on current filters (memoized to prevent infinite re-renders)
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    ...(debouncedSearch && { name: debouncedSearch }),
    ...(filters.classId && { classId: filters.classId }),
    ...(filters.academicYearId && { academicYearId: filters.academicYearId }),
    ...(filters.gender && { gender: filters.gender }),
    ...(filters.admissionDateFrom && { admissionDateFrom: filters.admissionDateFrom.toISOString().split('T')[0] }),
    ...(filters.admissionDateTo && { admissionDateTo: filters.admissionDateTo.toISOString().split('T')[0] }),
    // Handle status from both tab and advanced filter
    ...((activeFilter === "active" || filters.status === "active") && { isActive: true }),
    ...((activeFilter === "inactive" || filters.status === "inactive") && { isActive: false }),
  }), [currentPage, pageSize, debouncedSearch, filters, activeFilter]);

  // Fetch students using the custom hook
  const {
    data: studentsData,
    isLoading: loading,
    error,
    refetch,
  } = useStudents(queryParams);

  // Get students stats for tab counts
  const stats = useStudentsStats();

  const students = studentsData?.students || [];
  const pagination = studentsData?.pagination;
  
  // Check if search is in progress (search term is different from debounced)
  const isSearching = filters.search !== debouncedSearch;

  // Handle API errors using useEffect to prevent infinite re-renders
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student data",
      });
    }
  }, [error, toast]);

  // Filter change handler
  const handleFilterChange = useCallback((value: string) => {
    setActiveFilter(value);
    setCurrentPage(1); // Reset to first page when changing filters
  }, []);

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: AdvancedFilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({ search: "" });
    setCurrentPage(1);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Action handlers with permission checks
  const handleOpenAddDialog = useCallback(() => {
    if (!hasPermission('students:create')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to create students.",
      });
      return;
    }
    setAddDialogOpen(true);
  }, [hasPermission, toast]);

  const handleOpenEditDialog = useCallback((student: Task) => {
    if (!hasPermission('students:update')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to edit students.",
      });
      return;
    }
    setSelectedStudent(student);
    setEditDialogOpen(true);
  }, [hasPermission, toast]);

  const handleOpenViewDialog = useCallback((student: Task) => {
    if (!hasPermission('students:read')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to view student details.",
      });
      return;
    }
    setSelectedStudent(student);
    setViewDialogOpen(true);
  }, [hasPermission, toast]);

  const handleOpenDeleteDialog = useCallback((student: Task) => {
    if (!hasPermission('students:delete')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to delete students.",
      });
      return;
    }
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  }, [hasPermission, toast]);

  // New action handlers
  const handleToggleStatus = useCallback((student: Task) => {
    toggleStatusMutation.mutate(student.id);
  }, [toggleStatusMutation]);

  const handleDownloadProfile = useCallback((student: Task) => {
    // TODO: Implement profile download functionality
    toast({
      title: "Download Profile",
      description: `Downloading profile for ${student.firstName} ${student.lastName}`,
    });
  }, [toast]);

  const handleCopyDetails = useCallback((student: Task) => {
    const details = `
Name: ${student.firstName} ${student.lastName}
Student ID: ${student.studentId}
Roll Number: ${student.rollNumber}
Class: ${student.className}
Mobile: ${student.studentMobile}
Email: ${student.studentEmail || 'N/A'}
Parent: ${student.fatherName}
Parent Mobile: ${student.parentMobile}
    `.trim();

    navigator.clipboard.writeText(details).then(() => {
      toast({
        title: "Details Copied",
        description: "Student details have been copied to clipboard",
      });
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy details to clipboard",
      });
    });
  }, [toast]);

  const handleSendEmail = useCallback((student: Task) => {
    // TODO: Implement email sending functionality
    const email = student.studentEmail || student.rawData?.parentInfo?.email;
    if (email) {
      window.open(`mailto:${email}?subject=Regarding ${student.firstName} ${student.lastName}`);
    } else {
      toast({
        variant: "destructive",
        title: "No Email Available",
        description: "No email address found for this student or parent",
      });
    }
  }, [toast]);

  const handleSendMessage = useCallback((student: Task) => {
    // TODO: Implement messaging functionality
    toast({
      title: "Send Message",
      description: `Opening message dialog for ${student.firstName} ${student.lastName}`,
    });
  }, [toast]);

  const handleViewReports = useCallback((student: Task) => {
    // TODO: Implement reports viewing functionality
    toast({
      title: "View Reports",
      description: `Opening reports for ${student.firstName} ${student.lastName}`,
    });
  }, [toast]);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      // Use our centralized service for template download
      const blobData = await downloadStudentTemplateService();

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(blobData);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "student_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Template Downloaded",
        description: "Student Excel template has been downloaded successfully",
      });
    } catch (error) {
      console.error("Failed to download template:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to download the template file",
      });
    }
  }, [toast]);

  const handleUploadClick = useCallback(() => {
    setUploadDialogOpen(true);
  }, []);

  // Success callbacks
  const handleOperationSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Memoize columns to prevent re-creation on every render
  const tableColumns = useMemo(() => columns({
    onView: handleOpenViewDialog,
    onEdit: handleOpenEditDialog,
    onDelete: handleOpenDeleteDialog,
    onToggleStatus: handleToggleStatus,
    onDownloadProfile: handleDownloadProfile,
    onCopyDetails: handleCopyDetails,
    onSendEmail: handleSendEmail,
    onSendMessage: handleSendMessage,
    onViewReports: handleViewReports,
  }), [
    handleOpenViewDialog, 
    handleOpenEditDialog, 
    handleOpenDeleteDialog, 
    handleToggleStatus,
    handleDownloadProfile,
    handleCopyDetails,
    handleSendEmail,
    handleSendMessage,
    handleViewReports,
  ]);

  return (
    <>
      <div className="w-full h-full flex-col space-y-8 pt-3">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Students</h2>
            <p className="text-muted-foreground">
              Manage your students, classes, and academic details
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <RBACPermissionGuard permissions="students:create">
              <Button
                onClick={handleOpenAddDialog}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </RBACPermissionGuard>
            
            <RBACPermissionGuard permissions="students:create">
              <Button variant="outline" onClick={handleUploadClick}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
            </RBACPermissionGuard>
            
            <RBACPermissionGuard permissions="students:read">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Template
              </Button>
            </RBACPermissionGuard>
          </div>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleFiltersReset}
        />
        {/* {Task Table} */}
        <div>
          <Tabs
            defaultValue="all"
            value={activeFilter}
            onValueChange={handleFilterChange}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All Students {stats.total > 0 && `(${stats.total})`}
              </TabsTrigger>
              <TabsTrigger value="active">
                Active {stats.active > 0 && `(${stats.active})`}
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive {stats.inactive > 0 && `(${stats.inactive})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div>
              {loading || isSearching ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                          {isSearching ? "Searching..." : "Loading students..."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <DataTable
                      data={students}
                      columns={tableColumns}
                      statuses={statuses}
                      priorities={priorities}
                      AddButtonText="Add Student"
                      AddButtonFun={handleOpenAddDialog}
                      isAddButtonDisabled={false}
                      totalCount={pagination?.total || 0}
                      pageCount={pagination?.pages || 1}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      pageSize={pageSize}
                      hideSearch={true}
                    />
                  )}
              </div>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <Card className="p-1">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <DataTable
                      data={students}
                      columns={columns({
                        onView: handleOpenViewDialog,
                        onEdit: handleOpenEditDialog,
                        onDelete: handleOpenDeleteDialog,
                      })}
                      statuses={statuses}
                      priorities={priorities}
                      AddButtonText="Add Student"
                      AddButtonFun={handleOpenAddDialog}
                      isAddButtonDisabled={false}
                      hideSearch={true}
                      totalCount={pagination?.total || 0}
                      pageCount={pagination?.pages || 1}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      pageSize={pageSize}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inactive" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <DataTable
                      data={students}
                      columns={columns({
                        onView: handleOpenViewDialog,
                        onEdit: handleOpenEditDialog,
                        onDelete: handleOpenDeleteDialog,
                      })}
                      statuses={statuses}
                      priorities={priorities}
                      AddButtonText="Add Student"
                      AddButtonFun={handleOpenAddDialog}
                      isAddButtonDisabled={false}
                      hideSearch={true}
                      totalCount={pagination?.total || 0}
                      pageCount={pagination?.pages || 1}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      pageSize={pageSize}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {/* Dialog Components - Protected by permissions */}
        <RBACPermissionGuard permissions="students:create">
          <StudentRegistrationDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onSuccess={handleOperationSuccess}
          />
        </RBACPermissionGuard>

        <RBACPermissionGuard permissions="students:update">
          <EditStudentDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            student={selectedStudent}
            onSuccess={handleOperationSuccess}
          />
        </RBACPermissionGuard>

        <RBACPermissionGuard permissions="students:read">
          <ViewStudentDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            studentId={selectedStudent?.id || null}
          />
        </RBACPermissionGuard>

        <RBACPermissionGuard permissions="students:delete">
          <DeleteStudentDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            studentId={selectedStudent?.id || null}
            studentName={
              selectedStudent
                ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                : null
            }
            onSuccess={handleOperationSuccess}
          />
        </RBACPermissionGuard>

        <RBACPermissionGuard permissions="students:create">
          <UploadStudentsDialog
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            onSuccess={handleOperationSuccess}
          />
        </RBACPermissionGuard>
      </div>
    </>
  );
}

// Export page with RBAC protection
export default withRBACPermission(StudentsPage, {
  permissions: 'students:read',
  redirectTo: '/dashboard',
  fallbackComponent: () => (
    <div className="flex items-center justify-center h-64">
      <Card className="p-6">
        <CardContent className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access student management.</p>
          <p className="text-sm text-gray-500 mt-2">Required permission: students:read</p>
        </CardContent>
      </Card>
    </div>
  )
});
