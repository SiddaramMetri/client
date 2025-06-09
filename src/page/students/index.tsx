// import { z } from "zod"

// import { columns } from "@/components/ui/table/columns"
import { DataTable } from "@/components/ui/table/data-table";
import { UserNav } from "@/components/ui/table/user-nav";
// import { taskSchema } from "./data/schema"
import New_tasks from "./data/tasks.json";
import { columns } from "./data/columns";
import { new_statuses } from "../users/data/data";
import { priorities } from "./data/data";

// Simulate a database read for tasks.
// async function getTasks() {

//   const tasks = New_tasks

//   return z.array(taskSchema).parse(tasks)
// }

export default function StudentsPage() {
  const tasks = New_tasks;

  console.log("tasks ====>", tasks);

  return (
    <>
      <div className="min-h-screen w-full bg-background">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-6">
            {/* Header Section */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Students
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Here&apos;s a list of your students.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <UserNav />
              </div>
            </div>

            {/* Table Section */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <DataTable
                data={tasks}
                columns={columns}
                statuses={new_statuses}
                priorities={priorities}
                AddButtonText="Add Student"
                AddButtonFun={() => console.log("Add Student clicked")}
                isAddButtonDisabled={false} // Set to true if you want to disable the button
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
