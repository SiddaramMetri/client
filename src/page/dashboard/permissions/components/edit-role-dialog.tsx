import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateRole } from "@/hooks/api/use-rbac";
import { permissionService } from "@/services/rbac.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Crown,
  Eye,
  Filter,
  Loader2,
  Phone,
  Save,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const editRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  code: z
    .string()
    .min(2, "Role code must be at least 2 characters")
    .regex(
      /^[a-z_]+$/,
      "Role code must contain only lowercase letters and underscores"
    ),
  description: z.string().optional(),
  level: z.number().min(1).max(10),
  permissions: z
    .array(z.string())
    .min(1, "Please select at least one permission"),
  isActive: z.boolean(),
});

type EditRoleFormData = z.infer<typeof editRoleSchema>;

interface EditRoleDialogProps {
  role: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditRoleDialog({
  role,
  open,
  onOpenChange,
}: EditRoleDialogProps) {
  const { toast } = useToast();
  const updateRoleMutation = useUpdateRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSelectedModule("all");
    }
  }, [open]);

  // Fetch all permissions for selection
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions_all"],
    queryFn: () => permissionService.getAllPermissionsWithoutPagination(),
  });

  const permissions = permissionsData?.data || [];

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc: any, permission: any) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  const form = useForm<EditRoleFormData>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      name: role?.name || "",
      code: role?.code || "",
      description: role?.description || "",
      level: role?.level || 5,
      permissions: role?.permissions || [],
      isActive: role?.isActive ?? true,
    },
  });

  // Update form when role changes - Fix permission pre-filling
  useEffect(() => {
    if (role && open) {
      // Extract permission codes from role permissions
      let permissionCodes = [];
      if (role.permissions) {
        if (Array.isArray(role.permissions)) {
          // Handle both string arrays and object arrays
          permissionCodes = role.permissions
            .map((p: any) => (typeof p === "string" ? p : p.code || p._id))
            .filter(Boolean);
        }
      }

      form.reset({
        name: role.name || "",
        code: role.code || "",
        description: role.description || "",
        level: role.level || 5,
        permissions: permissionCodes,
        isActive: role.isActive !== false,
      });
    }
  }, [role, open, form]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px"; // Prevent layout shift
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [open]);

  const onSubmit = (data: EditRoleFormData) => {
    updateRoleMutation.mutate(
      {
        id: role._id,
        data: {
          ...data,
          permissions: data.permissions.map((code) => ({ code })), // Convert to proper format
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Role updated successfully",
          });
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              error.response?.data?.message || "Failed to update role",
          });
        },
      }
    );
  };

  const getRoleLevelInfo = (level: number) => {
    switch (level) {
      case 1:
        return {
          icon: Crown,
          color: "text-red-600 bg-red-100 border-red-200",
          label: "Super Admin",
        };
      case 2:
        return {
          icon: Shield,
          color: "text-orange-600 bg-orange-100 border-orange-200",
          label: "Admin",
        };
      case 3:
        return {
          icon: Users,
          color: "text-blue-600 bg-blue-100 border-blue-200",
          label: "Manager",
        };
      case 4:
        return {
          icon: Users,
          color: "text-green-600 bg-green-100 border-green-200",
          label: "User",
        };
      default:
        return {
          icon: Users,
          color: "text-gray-600 bg-gray-100 border-gray-200",
          label: "Custom",
        };
    }
  };

  const levelInfo = getRoleLevelInfo(form.watch("level") || 5);
  const LevelIcon = levelInfo.icon;

  // Filter and search permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((permission) => {
      const matchesSearch =
        searchTerm === "" ||
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesModule =
        selectedModule === "all" || permission.module === selectedModule;

      return matchesSearch && matchesModule;
    });
  }, [permissions, searchTerm, selectedModule]);

  // Get unique modules for filter dropdown
  const availableModules = useMemo(() => {
    const modules = [...new Set(permissions.map((p) => p.module))];
    return modules.sort();
  }, [permissions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        className="fixed right-0 top-0 h-screen max-w-5xl w-full data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-300 rounded-l-lg border-l shadow-2xl bg-white p-0 flex flex-col z-50"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${levelInfo.color}`}>
              <LevelIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Edit Role: {role?.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {role?.isSystem ? (
                  <span className="flex items-center space-x-1 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>System role - restricted modifications</span>
                  </span>
                ) : (
                  "Modify role details and permissions"
                )}
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {/* Content Area with Tabs */}
        <div className="flex-1 flex flex-col min-h-0">
          {role?.isSystem && (
            <div className="flex-shrink-0 mx-6 mt-4 mb-2 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <strong>System Role:</strong> This is a critical system role.
                Some modifications may be restricted.
              </div>
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 flex flex-col min-h-0"
            >
              <Tabs
                defaultValue="basic"
                className="flex-1 flex flex-col px-6 min-h-0"
              >
                <TabsList className="flex-shrink-0 grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="basic" className="text-sm">
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="text-sm">
                    Permissions
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-sm">
                    Preview
                  </TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent
                  value="basic"
                  className="flex-1 min-h-0 overflow-hidden pr-2"
                >
                  <div className="h-full overflow-y-auto scrollbar">
                    <div className="space-y-6 pb-6">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Role Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Content Manager"
                                  {...field}
                                  disabled={role?.isSystem}
                                  className="h-10"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Role Code
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., content_manager"
                                  {...field}
                                  disabled={role?.isSystem}
                                  className="h-10 font-mono text-sm"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Unique identifier (lowercase, underscores only)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this role is for..."
                                {...field}
                                className="min-h-[80px] resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Role Level
                              </FormLabel>
                              <div className="flex items-center space-x-3">
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    placeholder="5"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                    disabled={role?.isSystem}
                                    className="h-10 w-20"
                                  />
                                </FormControl>
                                <div
                                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${levelInfo.color}`}
                                >
                                  <LevelIcon className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {levelInfo.label}
                                  </span>
                                </div>
                              </div>
                              <FormDescription className="text-xs">
                                Lower numbers = higher privilege (1 = highest,
                                10 = lowest)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">
                                  Active Status
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Enable or disable this role
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={role?.isSystem}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent
                  value="permissions"
                  className="flex-1 min-h-0 overflow-hidden"
                >
                  <FormField
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      const selectedCount = field.value.length;
                      const allSelected =
                        permissions.length > 0 &&
                        field.value.length === permissions.length;

                      // Group permissions by module and action for grid layout
                      const permissionsByModule = useMemo(() => {
                        const modules: Record<
                          string,
                          Record<string, any[]>
                        > = {};

                        filteredPermissions.forEach((permission) => {
                          const module = permission.module || "other";
                          const action =
                            permission.action ||
                            permission.code.split(":")[1] ||
                            "manage";

                          if (!modules[module]) {
                            modules[module] = {};
                          }
                          if (!modules[module][action]) {
                            modules[module][action] = [];
                          }
                          modules[module][action].push(permission);
                        });

                        return modules;
                      }, [filteredPermissions]);

                      // Get all unique actions
                      const allActions = useMemo(() => {
                        const actions = new Set<string>();
                        Object.values(permissionsByModule).forEach(
                          (modulePerms) => {
                            Object.keys(modulePerms).forEach((action) =>
                              actions.add(action)
                            );
                          }
                        );
                        return Array.from(actions).sort();
                      }, [permissionsByModule]);

                      const getActionLabel = (action: string) => {
                        switch (action) {
                          case "create":
                            return "Can Create";
                          case "read":
                            return "Can See";
                          case "update":
                            return "Can Edit";
                          case "delete":
                            return "Can Delete";
                          case "manage":
                            return "Full Access";
                          case "execute":
                            return "Can Execute";
                          default:
                            return `Can ${
                              action.charAt(0).toUpperCase() + action.slice(1)
                            }`;
                        }
                      };

                      const isModuleActionSelected = (
                        module: string,
                        action: string
                      ) => {
                        const moduleActions =
                          permissionsByModule[module]?.[action] || [];
                        return (
                          moduleActions.length > 0 &&
                          moduleActions.every((p) =>
                            field.value.includes(p.code)
                          )
                        );
                      };

                      const toggleModuleAction = (
                        module: string,
                        action: string
                      ) => {
                        const moduleActions =
                          permissionsByModule[module]?.[action] || [];
                        const codes = moduleActions.map((p) => p.code);
                        const allSelected = codes.every((code) =>
                          field.value.includes(code)
                        );

                        if (allSelected) {
                          // Deselect all permissions for this module-action
                          field.onChange(
                            field.value.filter((p) => !codes.includes(p))
                          );
                        } else {
                          // Select all permissions for this module-action
                          const newPermissions = [
                            ...new Set([...field.value, ...codes]),
                          ];
                          field.onChange(newPermissions);
                        }
                      };

                      return (
                        <FormItem className="h-full flex flex-col min-h-0">
                          <div className="flex-shrink-0 space-y-1">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div>
                                <FormLabel className="text-lg font-semibold text-gray-900">
                                  PERMISSIONS
                                </FormLabel>
                                <FormDescription className="text-sm text-gray-600">
                                  Configure what this role can access and
                                  perform
                                </FormDescription>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Badge
                                  variant="secondary"
                                  className="text-sm font-medium"
                                >
                                  {selectedCount} / {permissions.length}{" "}
                                  selected
                                </Badge>
                                <Button
                                  type="button"
                                  variant={allSelected ? "outline" : "default"}
                                  size="sm"
                                  className="h-8"
                                  onClick={() => {
                                    if (allSelected) {
                                      field.onChange([]);
                                    } else {
                                      field.onChange(
                                        permissions.map((p) => p.code)
                                      );
                                    }
                                  }}
                                >
                                  {allSelected ? "Clear All" : "Select All"}
                                </Button>
                              </div>
                            </div>

                            {/* Search and Filter */}
                            <div className="flex space-x-3">
                              <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  placeholder="Search modules or permissions..."
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                  className="pl-10 h-10 border-gray-300"
                                />
                              </div>
                              <Select
                                value={selectedModule}
                                onValueChange={setSelectedModule}
                              >
                                <SelectTrigger className="w-48 h-10">
                                  <Filter className="h-4 w-4 mr-2" />
                                  <SelectValue placeholder="Filter by module" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    All Modules
                                  </SelectItem>
                                  {availableModules.map((module) => (
                                    <SelectItem key={module} value={module}>
                                      {module.charAt(0).toUpperCase() +
                                        module.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Permissions Grid */}
                          <div className="flex-1 min-h-0 overflow-hidden">
                            {permissionsLoading ? (
                              <div className="flex items-center justify-center h-40">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="ml-3 text-lg">
                                  Loading permissions...
                                </span>
                              </div>
                            ) : Object.keys(permissionsByModule).length ===
                              0 ? (
                              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                <Search className="h-12 w-12 mb-3 opacity-50" />
                                <p className="text-lg font-medium">
                                  No permissions found
                                </p>
                                <p className="text-sm">
                                  Try adjusting your search or filter
                                </p>
                              </div>
                            ) : (
                              <div className="h-full overflow-y-auto scrollbar permissions-grid rounded-lg">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="text-left px-4 py-2 font-medium">
                                        Module
                                      </th>
                                      {allActions.map((action) => (
                                        <th
                                          key={action}
                                          className="text-center px-4 py-2 font-medium"
                                        >
                                          {getActionLabel(action)}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(permissionsByModule).map(
                                      ([module, modulePerms]) => (
                                        <tr
                                          key={module}
                                          className="border-t hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 capitalize">
                                              {module === "other"
                                                ? "General"
                                                : module}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {
                                                Object.values(
                                                  modulePerms
                                                ).flat().length
                                              }{" "}
                                              permission
                                              {Object.values(modulePerms).flat()
                                                .length !== 1
                                                ? "s"
                                                : ""}
                                            </div>
                                          </td>
                                          {allActions.map((action) => {
                                            const hasAction =
                                              modulePerms[action];
                                            const isSelected =
                                              hasAction &&
                                              isModuleActionSelected(
                                                module,
                                                action
                                              );
                                            const isPartiallySelected =
                                              hasAction &&
                                              modulePerms[action].some((p) =>
                                                field.value.includes(p.code)
                                              ) &&
                                              !isSelected;

                                            return (
                                              <td
                                                key={action}
                                                className="px-4 py-3 text-center"
                                              >
                                                {hasAction ? (
                                                  <div className="flex items-center justify-center">
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <div className="flex items-center gap-1 cursor-help">
                                                          <Checkbox
                                                            checked={isSelected}
                                                            ref={(checkbox) => {
                                                              if (
                                                                checkbox &&
                                                                isPartiallySelected
                                                              ) {
                                                                (
                                                                  checkbox as any
                                                                ).indeterminate =
                                                                  true;
                                                              }
                                                            }}
                                                            onCheckedChange={() =>
                                                              toggleModuleAction(
                                                                module,
                                                                action
                                                              )
                                                            }
                                                            className="w-5 h-5 permissions-checkbox"
                                                          />
                                                          {(isSelected ||
                                                            isPartiallySelected) && (
                                                            <div className="ml-2">
                                                              {isSelected ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                              ) : (
                                                                <div className="w-4 h-4 bg-blue-600 rounded-sm" />
                                                              )}
                                                            </div>
                                                          )}
                                                        </div>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p>
                                                          {isSelected
                                                            ? "Selected"
                                                            : "Not Selected"}
                                                        </p>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  </div>
                                                ) : (
                                                  <div className="text-gray-300">
                                                    —
                                                  </div>
                                                )}
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                                {/* <div className="p-1">
                                  
                                  <div className="grid grid-cols-12 gap-4 mb-2 pb-2 border-b border-gray-200">
                                    <div className="col-span-3">
                                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Module</h3>
                                    </div>
                                    {allActions.map(action => (
                                      <div key={action} className="col-span-2 text-center">
                                        <h3 className="text-sm font-semibold text-gray-700">{getActionLabel(action)}</h3>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="space-y-3">
                                    {Object.entries(permissionsByModule).map(([module, modulePerms]) => (
                                      <div key={module} className="module-row grid grid-cols-12 gap-4 items-center py-1 px-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                        <div className="col-span-3">
                                          <div className="font-medium text-gray-900 capitalize">
                                            {module === 'other' ? 'General' : module}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            {Object.values(modulePerms).flat().length} permission{Object.values(modulePerms).flat().length !== 1 ? 's' : ''}
                                          </div>
                                        </div>
                                        {allActions.map(action => {
                                          const hasAction = modulePerms[action];
                                          const isSelected = hasAction && isModuleActionSelected(module, action);
                                          const isPartiallySelected = hasAction && modulePerms[action].some(p => field.value.includes(p.code)) && !isSelected;
                                          
                                          return (
                                            <div key={action} className="col-span-2 text-center">
                                              {hasAction ? (
                                                <div className="flex items-center justify-center">
                                                  <Checkbox
                                                    checked={isSelected}
                                                    ref={checkbox => {
                                                      if (checkbox && isPartiallySelected) {
                                                        (checkbox as any).indeterminate = true;
                                                      }
                                                    }}
                                                    onCheckedChange={() => toggleModuleAction(module, action)}
                                                    className="w-5 h-5"
                                                  />
                                                  <div className="ml-2 text-xs text-gray-600">
                                                    {isSelected ? (
                                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    ) : isPartiallySelected ? (
                                                      <div className="w-4 h-4 bg-blue-600 rounded-sm" />
                                                    ) : null}
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="text-gray-300">—</div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ))}
                                  </div>
                                </div> */}
                              </div>
                            )}
                          </div>

                          {/* Summary */}
                          <div className="flex-shrink-0 pt-4 flex items-center justify-between text-sm text-gray-600">
                            <div>
                              Showing{" "}
                              <span className="font-medium">
                                {Object.keys(permissionsByModule).length}
                              </span>{" "}
                              modules with{" "}
                              <span className="font-medium">
                                {filteredPermissions.length}
                              </span>{" "}
                              permissions
                            </div>
                            {selectedCount > 0 && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-medium">
                                  {selectedCount} permissions active
                                </span>
                              </div>
                            )}
                          </div>

                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent
                  value="preview"
                  className="flex-1 min-h-0 overflow-hidden pr-2"
                >
                  <div className="h-full overflow-y-auto scrollbar">
                    <div className="space-y-6 pb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Eye className="h-5 w-5" />
                          <span>Role Preview</span>
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              Name
                            </label>
                            <p className="text-sm font-medium text-gray-900">
                              {form.watch("name") || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              Code
                            </label>
                            <p className="text-sm font-mono text-gray-900">
                              {form.watch("code") || "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Description
                          </label>
                          <p className="text-sm text-gray-700">
                            {form.watch("description") ||
                              "No description provided"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`p-2 rounded-lg border ${levelInfo.color}`}
                            >
                              <LevelIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Level {form.watch("level") || 5}
                              </p>
                              <p className="text-xs text-gray-600">
                                {levelInfo.label}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle2
                              className={`h-4 w-4 ${
                                form.watch("isActive")
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <span className="text-sm text-gray-700">
                              {form.watch("isActive") ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Assigned Permissions (
                          {form.watch("permissions")?.length || 0})
                        </h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar">
                          {Object.entries(groupedPermissions).map(
                            ([module, modulePermissions]: [string, any[]]) => {
                              const selectedPermissions =
                                modulePermissions.filter((p) =>
                                  form.watch("permissions")?.includes(p.code)
                                );
                              if (selectedPermissions.length === 0) return null;

                              return (
                                <div
                                  key={module}
                                  className="border rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                      {module}
                                    </h5>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {selectedPermissions.length} permissions
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 gap-1">
                                    {selectedPermissions.map((permission) => (
                                      <div
                                        key={permission._id}
                                        className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                                      >
                                        <span className="font-medium">
                                          {permission.name}
                                        </span>
                                        <code className="text-gray-500">
                                          {permission.code}
                                        </code>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                        {(form.watch("permissions")?.length || 0) === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm italic">
                              No permissions selected
                            </p>
                            <p className="text-xs">
                              Go to the Permissions tab to assign permissions
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer */}
              <div className="flex-shrink-0 border-t p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateRoleMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {updateRoleMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Role
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
