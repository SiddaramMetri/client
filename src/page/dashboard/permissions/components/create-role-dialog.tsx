import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Save,
  Loader2,
  X,
  Search,
  Crown,
  Shield,
  Users,
  CheckCircle2,
  Eye,
  Filter,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roleService, permissionService } from "@/services/rbac.service";

const createRoleSchema = z.object({
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
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

interface CreateRoleDialogProps {
  children?: React.ReactNode;
}

export default function CreateRoleDialog({ children }: CreateRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      level: 5,
      permissions: [],
    },
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [open]);

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

  const createRoleMutation = useMutation({
    mutationFn: roleService.createRole,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role-stats"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create role",
      });
    },
  });

  const onSubmit = (data: CreateRoleFormData) => {
    createRoleMutation.mutate({
      ...data,
      isSystem: false,
      isActive: true,
      permissions: data.permissions.map((code: string) => code),
    });
  };

  // Auto-generate code from name
  const handleNameChange = (name: string) => {
    const code = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 20);
    form.setValue("code", code);
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

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="fixed right-0 top-0 h-screen max-w-5xl w-full data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-300 rounded-l-lg border-l shadow-2xl bg-white p-0 flex flex-col z-50"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg border bg-white shadow-sm">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Create New Role
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Create a new role with specific permissions. Users assigned this
                role will have access to the selected permissions.
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Area with Tabs */}
        <div className="flex-1 flex flex-col min-h-0">
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
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleNameChange(e.target.value);
                                  }}
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
                              Lower numbers = higher privilege (1 = highest, 10
                              = lowest)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                          <div className="flex-shrink-0 space-y-4">
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
                              </div>
                            )}
                          </div>

                          <div className="p-1">
                            {/* <div className="flex items-center justify-between mb-2">
                                    <div className="col-span-2">
                                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Module</h3>
                                    </div>
                                    {allActions.map(action => (
                                      <div key={action} className="text-center">
                                        <h3 className="text-sm font-semibold text-gray-700">{getActionLabel(action)}</h3>
                                      </div>
                                    ))}
                                  </div> */}

                            {/* Permission Rows */}
                            <div className="space-y-3"></div>
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
                      <div className="bg-white border-2 border-green-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <Eye className="h-6 w-6 text-green-600" />
                          <span>Role Preview</span>
                        </h3>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                              Role Name
                            </label>
                            <p className="text-lg font-bold text-gray-900 mt-1">
                              {form.watch("name") || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                              Role Code
                            </label>
                            <p className="text-lg font-mono text-gray-900 mt-1 bg-gray-100 px-3 py-1 rounded">
                              {form.watch("code") || "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Description
                          </label>
                          <p className="text-base text-gray-800 mt-2 leading-relaxed">
                            {form.watch("description") ||
                              "No description provided"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-3 rounded-lg border ${levelInfo.color}`}
                            >
                              <LevelIcon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                Level {form.watch("level") || 5}
                              </p>
                              <p className="text-sm font-medium text-gray-600">
                                {levelInfo.label}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-lg font-semibold text-gray-800">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Selected Permissions (
                          {form.watch("permissions")?.length || 0})
                        </h4>
                        <div className="space-y-4 max-h-80 overflow-y-auto scrollbar">
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
                                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                                      {module === "other" ? "General" : module}
                                    </h5>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs font-medium"
                                    >
                                      {selectedPermissions.length} permission
                                      {selectedPermissions.length !== 1
                                        ? "s"
                                        : ""}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 gap-2">
                                    {selectedPermissions.map((permission) => (
                                      <div
                                        key={permission._id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                          <span className="font-medium text-sm text-gray-900">
                                            {permission.name}
                                          </span>
                                        </div>
                                        <code className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded font-mono">
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
                          <div className="text-center py-12 text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                              <Shield className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-700 mb-2">
                              No permissions selected
                            </p>
                            <p className="text-sm text-gray-500">
                              Go to the Permissions tab to configure role access
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
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createRoleMutation.isPending}
                    className="min-w-[120px] bg-green-600 hover:bg-green-700"
                  >
                    {createRoleMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Role
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
