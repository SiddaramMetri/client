import { Row } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2, UserCog } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserDialog } from "@/hooks/use-user-dialog";
import { UsersTask, userSchema } from "../data/schema";

interface UserRowActionsProps<TData> {
  row: Row<TData>;
  schema?: z.ZodType<UsersTask>;
}

export function UserRowActions<TData>({
  row,
  schema = userSchema,
}: UserRowActionsProps<TData>) {
  const { onOpenEdit, onOpenDelete } = useUserDialog();
  const user = schema.parse(row.original) as UsersTask;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="data-[state=open]:bg-muted size-8"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem 
          className="cursor-pointer flex items-center"
          onClick={() => onOpenEdit(user)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer flex items-center"
        >
          <UserCog className="mr-2 h-4 w-4" />
          Manage Roles
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer flex items-center text-red-600 focus:text-red-600 hover:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50" 
          onClick={() => onOpenDelete(user)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}