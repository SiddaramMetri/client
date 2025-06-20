import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header"
import { MoreHorizontal, Edit, Trash, Eye, UserCheck, UserX } from "lucide-react"
import { User } from "./schema"
import { formatDistanceToNow } from "date-fns"
import { RBACPermissionGuard } from "@/components/resuable/permission-guard"
import { useRBACPermissions } from "@/hooks/use-permissions"

interface ActionsProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

const ActionsCell = ({ user, onView, onEdit, onDelete, onToggleStatus }: ActionsProps) => {
  const { hasPermission, canAccessOwnResource } = useRBACPermissions();
  
  // Check if user can access their own resource
  const canAccessOwn = canAccessOwnResource(user._id);
  
  // Determine what actions are available
  const canView = hasPermission('user:read') || canAccessOwn;
  const canEdit = hasPermission('user:update') || canAccessOwn;
  const canDelete = hasPermission('user:delete') && !canAccessOwn; // Can't delete yourself
  const canToggleStatus = hasPermission('users:manage') && !canAccessOwn; // Can't toggle own status
  
  // If no actions are available, don't show the menu
  if (!canView && !canEdit && !canDelete && !canToggleStatus) {
    return null;
  }

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
        
        {/* Copy ID - always available if dropdown is shown */}
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user._id)}>
          Copy user ID
        </DropdownMenuItem>
        
        {(canView || canEdit || canToggleStatus || canDelete) && <DropdownMenuSeparator />}
        
        {/* View Details */}
        {canView && (
          <DropdownMenuItem onClick={() => onView(user)}>
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
        )}
        
        {/* Edit User */}
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(user)}>
            <Edit className="mr-2 h-4 w-4" />
            {canAccessOwn ? 'Edit profile' : 'Edit user'}
          </DropdownMenuItem>
        )}
        
        {/* Toggle Status */}
        {canToggleStatus && (
          <DropdownMenuItem onClick={() => onToggleStatus(user)}>
            {user.isActive ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>
        )}
        
        {/* Delete User */}
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(user)}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete user
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const createColumns = (actions: {
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
}): ColumnDef<User>[] => [
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
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
            <AvatarFallback>
              {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">
              ID: {user._id.slice(-8)}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-mono text-sm">
          {row.getValue("email")}
        </div>
      );
    },
  },
  {
    id: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roles" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const roles = user.role?.roles || [];
      
      // Debug logging to check user data structure
      console.log('User role data:', {
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        roles: roles,
        rolesLength: roles.length
      });
      
      if (roles.length === 0) {
        return <Badge variant="outline">No Roles</Badge>;
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {roles.slice(0, 2).map((userRole) => (
            <Badge key={userRole.roleId} variant="secondary" className="text-xs">
              {userRole.roleName}
            </Badge>
          ))}
          {roles.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{roles.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "status",
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const user = row.original as any;
      const isActive = Boolean(user.isActive);
      
      // Debug logging
      console.log("User status debug:", { 
        userId: user._id,
        userName: user.name,
        isActiveRaw: user.isActive,
        isActiveProcessed: isActive,
        typeRaw: typeof user.isActive,
        userObject: user
      });
      
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
    accessorKey: "lastLogin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Login" />
    ),
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLogin") as string | null;
      if (!lastLogin) {
        return <span className="text-muted-foreground">Never</span>;
      }
      return (
        <div className="text-sm">
          {formatDistanceToNow(new Date(lastLogin), { addSuffix: true })}
        </div>
      );
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
      const user = row.original;
      return (
        <ActionsCell
          user={user}
          onView={actions.onView}
          onEdit={actions.onEdit}
          onDelete={actions.onDelete}
          onToggleStatus={actions.onToggleStatus}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
]