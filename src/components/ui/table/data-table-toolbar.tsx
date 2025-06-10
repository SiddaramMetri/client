import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>,
  AddButtonText?: string,
  AddButtonFun?: () => void,
  isAddButtonDisabled?: boolean,
  statuses: { label: string; value: string }[],
  priorities?: { label: string; value: string }[]
  showAddButton?: boolean
  searchColumn?: string
  searchPlaceholder?: string
}

export function DataTableToolbar<TData>({
  table,
  AddButtonText,
  AddButtonFun,
  isAddButtonDisabled,
  statuses,
  priorities,
  showAddButton=false,
  searchColumn = "title",
  searchPlaceholder = "Filter..."
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
        <Input
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
          }
          className="h-9 w-full sm:w-[150px] lg:w-[250px]"
        />
        <div className="flex flex-wrap gap-2">
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          )}
          {(table.getColumn("priority") && priorities) && (
            <DataTableFacetedFilter
              column={table.getColumn("priority")}
              title="Priority"
              options={priorities || []}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
              className="h-9 px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <DataTableViewOptions table={table} />
       {showAddButton && (
         <Button
           size="sm"
           className="h-9 px-4"
           onClick={AddButtonFun}
           disabled={!isAddButtonDisabled}
         >
           {AddButtonText || "Add Task"}
         </Button>
       )}
      </div>
    </div>
  )
}
