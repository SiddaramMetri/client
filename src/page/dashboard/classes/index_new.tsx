import { DataTable } from "@/components/ui/table/data-table";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { ClassesDialog } from "./components/classes-dialog";
import { columns } from "./data/columns";
import { mockClasses } from "./data/mock";
import { ClassData } from "./data/schema.ts";

// Status options for the data table filter
const classStatuses = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
];

// Priority options for the data table filter (unused but required by component)
const classPriorities = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>(mockClasses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const { toast } = useToast();
  
  // Log the loaded mock data for verification
  useEffect(() => {
    console.log(`Loaded ${classes.length} class records from mock data`);
  }, [classes]);
  
  const handleAddClass = (classData: ClassData) => {
    // In a real app, you'd make an API call here
    const newClass = {
      ...classData,
      id: (classes.length + 1).toString(),
      _id: `new-class-${Date.now()}`, // Generate a mock _id
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClasses([...classes, newClass]);
    toast({
      title: "Class Created",
      description: `Successfully created ${classData.name} ${classData.section || ""}`
    });
  };
  
  const handleUpdateClass = (classData: ClassData) => {
    // In a real app, you'd make an API call here
    const updatedClasses = classes.map(c => 
      c._id === classData._id ? {...classData, updatedAt: new Date().toISOString()} : c
    );
    setClasses(updatedClasses);
    toast({
      title: "Class Updated",
      description: `Successfully updated ${classData.name} ${classData.section || ""}`
    });
  };
  
  const handleDeleteClass = (id: string) => {
    // In a real app, you'd make an API call here
    const classToDelete = classes.find(c => c._id === id);
    const filteredClasses = classes.filter(c => c._id !== id);
    setClasses(filteredClasses);
    toast({
      title: "Class Deleted",
      description: `Successfully deleted ${classToDelete?.name} ${classToDelete?.section || ""}`,
    });
  };
  
  const openAddDialog = () => {
    setEditingClass(null);
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (classData: ClassData) => {
    setEditingClass(classData);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="min-h-screen w-full bg-background">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-6">
            {/* Header Section */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Classes
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Manage your classes and sections
                </p>
              </div>
            </div>

            {/* Table Section */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <DataTable 
                data={classes}
                columns={columns({
                  onEdit: openEditDialog,
                  onDelete: handleDeleteClass
                })}
                statuses={classStatuses}
                priorities={classPriorities}
                AddButtonText="Add Class"
                AddButtonFun={openAddDialog}
                isAddButtonDisabled={false}
                showAddButton={true}
                searchColumn="name"
                searchPlaceholder="Search classes..."
                pageCount={0}
                currentPage={0}
                onPageChange={() => {}}
                pageSize={0}
                onPageSizeChange={() => {}}
                totalCount={0}
                search={""}
                handleSearchChange={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
      
      <ClassesDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        initialData={editingClass}
        onSave={(data) => {
          if (editingClass) {
            handleUpdateClass(data);
          } else {
            handleAddClass(data);
          }
          setIsDialogOpen(false);
        }}
      />
    </>
  );
}
