import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { columns } from "./data/columns";
import New_tasks from "./data/tasks2.json";
import { useUserDialog } from "@/hooks/use-user-dialog";
import AddUserDialog from "./components/add-user-dialog";
import EditUserDialog from "./components/edit-user-dialog";
import DeleteUserDialog from "./components/delete-user-dialog";

export default function UsersPage () {
  const tasks = New_tasks;
  const { onOpenAdd } = useUserDialog();

  return (
    <>
      <div className="min-h-screen w-full bg-background">
        <div className="container mx-auto px-4 py-6 sm:px-2 lg:px-2">
          <div className="flex flex-col space-y-6">
            {/* Header Section */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <div className="text-sm font-bold tracking-tight text-foreground sm:text-2xl">
                  Users
                </div>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Here&apos;s a list of your users.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  size="sm"
                  className="h-9 px-4"
                  onClick={onOpenAdd}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {"Add User"}
                </Button>
              </div>
            </div>

            {/* Table Section */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <DataTable data={tasks} columns={columns} />
            </div>
          </div>
        </div>
      </div>
      
      {/* User Modals */}
      <AddUserDialog />
      <EditUserDialog />
      <DeleteUserDialog />
    </>
  )
}
