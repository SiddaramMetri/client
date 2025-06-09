// import { z } from "zod"


import { DataTable } from "@/components/ui/table/data-table"
import { UserNav } from "@/components/ui/table/user-nav"
// import { taskSchema } from "./data/schema"
import New_tasks from "./data/tasks2.json"
import { columns } from "./data/columns";

// Simulate a database read for tasks.
// async function getTasks() {
  
//   const tasks = New_tasks

//   return z.array(taskSchema).parse(tasks)
// }

export default function UsersPage () {
  const tasks =  New_tasks

  console.log("tasks ====>", tasks);

  return (
    <>
      <div className="min-h-screen w-full bg-background">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
              {/* <div className="flex items-center space-x-4">
                <UserNav />
              </div> */}
            </div>

            {/* Table Section */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <DataTable data={New_tasks} columns={columns}  />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
