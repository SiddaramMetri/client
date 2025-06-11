import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { MoreHorizontal, Edit, Trash, Eye, BookOpen, Users } from "lucide-react";
import { ClassData } from "./schema";
import { formatDistanceToNow } from "date-fns";

interface ActionsProps {
  classData: ClassData;
  onView: (classData: ClassData) => void;
  onEdit: (classData: ClassData) => void;
  onDelete: (classData: ClassData) => void;
}

const ActionsCell = ({ classData, onView, onEdit, onDelete }: ActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(classData._id)}>
          Copy class ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView(classData)}>
          <Eye className="mr-2 h-4 w-4" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(classData)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit class
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDelete(classData)}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createColumns = (actions: {
  onView: (classData: ClassData) => void;
  onEdit: (classData: ClassData) => void;
  onDelete: (classData: ClassData) => void;
}): ColumnDef<ClassData>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Class Name" />
    ),
    cell: ({ row }) => {
      const classData = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center h-8 w-8 bg-blue-100 rounded-full">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{classData.name}</div>
            {classData.section && (
              <div className="text-sm text-muted-foreground">
                Section {classData.section}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "academicYearId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Academic Year" />
    ),
    cell: ({ row }) => {
      const academicYear = row.original.academicYearId;
      return (
        <div className="text-sm">
          {academicYear?.year || academicYear?._id || 'Unknown'}
        </div>
      );
    },
  },
  {
    accessorKey: "classTeacherId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teacher" />
    ),
    cell: ({ row }) => {
      const teacher = row.original.classTeacherId;
      return (
        <div className="text-sm">
          {teacher?.name || (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "currentStudentCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Students" />
    ),
    cell: ({ row }) => {
      const classData = row.original;
      const utilizationPercentage = Math.round((classData.currentStudentCount / classData.maxStudents) * 100);
      
      return (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">
              {classData.currentStudentCount}/{classData.maxStudents}
            </div>
            <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
              <div 
                className="h-1.5 bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min(utilizationPercentage, 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, _, value) => {
      const isActive = row.getValue("isActive") as boolean;
      if (value === "all") return true;
      if (value === "active") return isActive === true;
      if (value === "inactive") return isActive === false;
      return true;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return (
        <div className="text-sm">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const classData = row.original;
      return (
        <ActionsCell
          classData={classData}
          onView={actions.onView}
          onEdit={actions.onEdit}
          onDelete={actions.onDelete}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];