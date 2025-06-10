import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
} from "lucide-react"

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

export const statuses = [
  {
    value: "backlog",
    label: "Backlog",
    icon: HelpCircle,
  },
  {
    value: "todo",
    label: "Todo",
    icon: Circle,
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: Timer,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle,
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: CircleOff,
  },
]


export const new_statuses = [
  {
    value: "inactive",
    label: "Inactive",
    icon: Circle,
    color: "text-muted-foreground",
  },
  {
    value: "active",
    label: "Active",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    value: "blocked",
    label: "Blocked",
    icon: CircleOff,
    color: "text-red-500",
  },
]

export const ROLES = [
  {
    value: "superadmin",
    label: "SuperAdmin",
    icon: CheckCircle,
  },
  {
    value: "admin",
    label: "Admin",
    icon: CheckCircle,
  },
  {
    value: "faculty",
    label: "Faculty",
    icon: CheckCircle,
  },
  {
    value: "guest",
    label: "Guest",
    icon: HelpCircle,
  },
  {
    value: "moderator",
    label: "Moderator",
    icon: Timer,
  },
]

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDown,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRight,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUp,
  },
]
