import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Download, Upload, UserPlus, Loader2 } from "lucide-react";
import { columns } from "./data/columns";
import { priorities } from "./data/priorities";
import { statuses } from "./data/statuses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import mockStudents from "./data/mock-students.json";
import { Task } from "./data/schema";
import EditStudentDialog from "./components/edit-student-dialog";
import ViewStudentDialog from "./components/view-student-dialog";
import DeleteStudentDialog from "./components/delete-student-dialog";
import UploadStudentsDialog from "./components/upload-students-dialog";
import StudentRegistrationDialog from "./components/student-registration-dialog";
import { downloadStudentTemplateService } from "@/services/student.service";

export default function StudentsPage() {
  const [tasks, setTasks] = useState<Task[]>(mockStudents); // Start with mock data, will be replaced with API
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Selected student for operations
  const [selectedStudent, setSelectedStudent] = useState<Task | null>(null);

  const { toast } = useToast();

  // Fetch students from API (using useCallback to avoid dependency issues)
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      // This would be the actual API call in a production environment
      // const response = await API.get("/student", {
      //   params: {
      //     isActive: activeFilter === 'active' ? true :
      //              activeFilter === 'inactive' ? false : undefined
      //   }
      // });
      // setTasks(response.data.students);

      // For now, simulate API call and use the mock data
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter mock data based on active filter
      if (activeFilter === "active") {
        setTasks(mockStudents.filter((student) => student.status === "active"));
      } else if (activeFilter === "inactive") {
        setTasks(
          mockStudents.filter((student) => student.status === "inactive")
        );
      } else {
        setTasks(mockStudents);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load student data",
      });
    } finally {
      setLoading(false);
    }
  }, [activeFilter, toast]); // Dependencies for the callback

  // Filter change handler
  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
  };

  // Effect to refetch data when filter changes
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Action handlers
  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (student: Task) => {
    setSelectedStudent(student);
    setEditDialogOpen(true);
  };

  const handleOpenViewDialog = (student: Task) => {
    setSelectedStudent(student);
    setViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (student: Task) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleDownloadTemplate = async () => {
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
        variant: "error",
        title: "Download Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to download the template file",
      });
    }
  };

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  // Success callbacks
  const handleOperationSuccess = () => {
    fetchStudents();
  };

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
            <Button
              onClick={handleOpenAddDialog}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
            <Button variant="outline" onClick={handleUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
          </div>
        </div>
        {/* {Task Table} */}
        <div>
          <Tabs
            defaultValue="all"
            value={activeFilter}
            onValueChange={handleFilterChange}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div>
              {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <DataTable
                      data={tasks}
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
                      search={""}
                      handleSearchChange={() => {}}
                      totalCount={tasks.length}
                      pageCount={1}
                      currentPage={1}
                      onPageChange={() => {}}
                      onPageSizeChange={() => {}}
                      pageSize={10}
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
                      data={tasks.filter((t) => t.status === "active")}
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
                      search={""}
                      handleSearchChange={() => {}}
                      totalCount={tasks.length}
                      pageCount={1}
                      currentPage={1}
                      onPageChange={() => {}}
                      onPageSizeChange={() => {}}
                      pageSize={10}
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
                      data={tasks.filter((t) => t.status === "inactive")}
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
                      search={""}
                      handleSearchChange={() => {}}
                      totalCount={tasks.length}
                      pageCount={1}
                      currentPage={1}
                      onPageChange={() => {}}
                      onPageSizeChange={() => {}}
                      pageSize={10}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {/* Dialog Components */}
        <StudentRegistrationDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={handleOperationSuccess}
        />

        <EditStudentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          student={selectedStudent}
          onSuccess={handleOperationSuccess}
        />

        <ViewStudentDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          studentId={selectedStudent?.id || null}
        />

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

        <UploadStudentsDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onSuccess={handleOperationSuccess}
        />
      </div>
    </>
  );
}
