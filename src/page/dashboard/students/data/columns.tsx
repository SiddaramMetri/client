import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header"
import { statuses } from "./statuses"
import { Task } from "./schema"
import { 
  Eye, 
  Pencil, 
  Trash, 
  User, 
  Phone, 
  Calendar, 
  GraduationCap,
  MoreHorizontal,
  UserCheck,
  UserX,
  Download,
  Copy,
  Mail,
  MessageSquare,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRBACPermissions } from "@/hooks/use-permissions"

// Define our action handlers interface for type safety
interface ActionsProps {
  onView?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleStatus?: (task: Task) => void
  onDownloadProfile?: (task: Task) => void
  onCopyDetails?: (task: Task) => void
  onSendEmail?: (task: Task) => void
  onSendMessage?: (task: Task) => void
  onViewReports?: (task: Task) => void
}

// Helper function to format date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return "N/A";
  }
};

// Helper function to get initials
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

// Updated columns function that accepts action handlers
export const columns = ({ 
  onView, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onDownloadProfile, 
  onCopyDetails, 
  onSendEmail, 
  onSendMessage, 
  onViewReports 
}: ActionsProps = {}): ColumnDef<Task>[] => [
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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "studentId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student ID" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px] font-mono text-sm">
        {row.getValue("studentId") || "N/A"}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => {
      const student = row.original;
      const profileImage = student.rawData?.profileImage;
      
      return (
        <div className="flex items-center gap-3 min-w-[200px]">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileImage} />
            <AvatarFallback className="text-xs">
              {getInitials(student.firstName, student.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {row.getValue("title")}
            </span>
            <span className="text-xs text-muted-foreground">
              {student.gender === "male" ? "♂" : student.gender === "female" ? "♀" : "⚧"} {student.gender}
            </span>
          </div>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "rollNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roll No." />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-center w-[80px]">
        {row.getValue("rollNumber") || "N/A"}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "class_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Class Details" />
    ),
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="flex flex-col gap-1 min-w-[130px]">
          <div className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium text-sm">{student.className}</span>
            {student.section !== "N/A" && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {student.section}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {student.academicYear}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: "contact_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ row }) => {
      const student = row.original;
      return (
        <TooltipProvider>
          <div className="flex flex-col gap-1 min-w-[120px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{student.studentMobile || "N/A"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Student Mobile</p>
              </TooltipContent>
            </Tooltip>
            {student.studentEmail && (
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {student.studentEmail}
              </span>
            )}
          </div>
        </TooltipProvider>
      )
    },
    enableSorting: false,
  },
  {
    id: "parent_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parent" />
    ),
    cell: ({ row }) => {
      const student = row.original;
      return (
        <TooltipProvider>
          <div className="flex flex-col gap-1 min-w-[130px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">{student.fatherName || "N/A"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Father's Name</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{student.parentMobile || "N/A"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Parent Mobile</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "dateOfBirth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1 min-w-[100px]">
        <Calendar className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm">{formatDate(row.getValue("dateOfBirth"))}</span>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "admissionDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Admission" />
    ),
    cell: ({ row }) => (
      <div className="text-sm min-w-[90px]">
        {formatDate(row.getValue("admissionDate"))}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex items-center gap-2 min-w-[80px]">
          <Badge variant={row.getValue("status") === "active" ? "default" : "secondary"}>
            {status.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const task = row.original
      const isActive = task.status === "active"
      
      // Create a component to access hooks
      const ActionsCell = () => {
        const { hasPermission } = useRBACPermissions()
        
        const canView = hasPermission('student:read')
        const canEdit = hasPermission('student:update')
        const canDelete = hasPermission('student:delete')
        const canToggleStatus = hasPermission('student:manage')
        const canDownload = hasPermission('student:read')
        const canCommunicate = hasPermission('students:communicate') || hasPermission('student:manage')
        const canViewReports = hasPermission('reports:read') || hasPermission('student:read')
        
        // If no permissions available, don't show actions
        if (!canView && !canEdit && !canDelete && !canToggleStatus && !canDownload && !canCommunicate && !canViewReports) {
          return null
        }

        return (
          <div className="flex items-center justify-end gap-1 min-w-[140px]">
            <TooltipProvider>
              {/* Quick Actions */}
              {canView && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView && onView(task)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Details</TooltipContent>
                </Tooltip>
              )}
              
              {canEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit && onEdit(task)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Student</TooltipContent>
                </Tooltip>
              )}
              
              {/* More Actions Dropdown - only show if there are additional actions */}
              {(canToggleStatus || canDownload || canCommunicate || canViewReports || canDelete) && (
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>More Actions</TooltipContent>
                  </Tooltip>
                  
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Student Actions</DropdownMenuLabel>
                    
                    {(canToggleStatus || canDownload) && <DropdownMenuSeparator />}
                    
                    {canToggleStatus && (
                      <DropdownMenuItem 
                        onClick={() => onToggleStatus && onToggleStatus(task)}
                        className={isActive ? "text-orange-600" : "text-green-600"}
                      >
                        {isActive ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate Student
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate Student
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    
                    {canDownload && (
                      <>
                        <DropdownMenuItem onClick={() => onDownloadProfile && onDownloadProfile(task)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download Profile
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onCopyDetails && onCopyDetails(task)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Details
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {canCommunicate && (
                      <>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => onSendEmail && onSendEmail(task)}
                          disabled={!task.studentEmail && !task.rawData?.parentInfo?.email}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onSendMessage && onSendMessage(task)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {canViewReports && (
                      <DropdownMenuItem onClick={() => onViewReports && onViewReports(task)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Reports
                      </DropdownMenuItem>
                    )}
                    
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => onDelete && onDelete(task)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Student
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TooltipProvider>
          </div>
        )
      }
      
      return <ActionsCell />
    },
    enableSorting: false,
    enableHiding: false,
  },
]
