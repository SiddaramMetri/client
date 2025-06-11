import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { 
  Filter, 
  X, 
  Search, 
  Calendar as CalendarIcon,
  GraduationCap,
  Users
} from "lucide-react";
import { ClassDropdown } from "@/components/form/class-dropdown";
import { AcademicYearDropdown } from "@/components/form/academic-year-dropdown";
import { format } from "date-fns";

export interface AdvancedFilterOptions {
  search: string;
  classId?: string;
  academicYearId?: string;
  gender?: string;
  admissionDateFrom?: Date;
  admissionDateTo?: Date;
  status?: string;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterOptions;
  onFiltersChange: (filters: AdvancedFilterOptions) => void;
  onReset: () => void;
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const updateFilter = (key: keyof AdvancedFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilter = (key: keyof AdvancedFilterOptions) => {
    onFiltersChange({
      ...filters,
      [key]: undefined,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.classId ||
      filters.academicYearId ||
      filters.gender ||
      filters.admissionDateFrom ||
      filters.admissionDateTo ||
      (filters.status && filters.status !== "all")
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.classId) count++;
    if (filters.academicYearId) count++;
    if (filters.gender) count++;
    if (filters.admissionDateFrom) count++;
    if (filters.admissionDateTo) count++;
    if (filters.status && filters.status !== "all") count++;
    return count;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, contact, roll number..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => updateFilter("search", "")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters() && (
              <Badge className="ml-2 px-1 py-0 text-xs min-w-[1.25rem] h-5">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Advanced Filters</h4>
              {hasActiveFilters() && (
                <Button variant="ghost" size="sm" onClick={onReset}>
                  Clear All
                </Button>
              )}
            </div>

            {/* Academic Year Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic Year
              </Label>
              <div className="flex gap-2">
                <AcademicYearDropdown
                  value={filters.academicYearId || ""}
                  onChange={(value) => updateFilter("academicYearId", value)}
                  placeholder="Select academic year"
                  className="flex-1"
                />
                {filters.academicYearId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter("academicYearId")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Class Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Class
              </Label>
              <div className="flex gap-2">
                <ClassDropdown
                  value={filters.classId || ""}
                  onChange={(value) => updateFilter("classId", value)}
                  academicYearId={filters.academicYearId}
                  placeholder="Select class"
                  className="flex-1"
                />
                {filters.classId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter("classId")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Gender Filter */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex gap-2">
                <Select
                  value={filters.gender || ""}
                  onValueChange={(value) => updateFilter("gender", value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {filters.gender && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter("gender")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {filters.status && filters.status !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter("status")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Admission Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Admission Date Range
              </Label>
              <div className="flex gap-2">
                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.admissionDateFrom ? (
                        format(filters.admissionDateFrom, "MMM dd, yyyy")
                      ) : (
                        "From date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.admissionDateFrom}
                      onSelect={(date) => {
                        updateFilter("admissionDateFrom", date);
                        setDateFromOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.admissionDateTo ? (
                        format(filters.admissionDateTo, "MMM dd, yyyy")
                      ) : (
                        "To date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.admissionDateTo}
                      onSelect={(date) => {
                        updateFilter("admissionDateTo", date);
                        setDateToOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {(filters.admissionDateFrom || filters.admissionDateTo) && (
                <div className="flex gap-1">
                  {filters.admissionDateFrom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter("admissionDateFrom")}
                    >
                      Clear From <X className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                  {filters.admissionDateTo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter("admissionDateTo")}
                    >
                      Clear To <X className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-1">
          {filters.classId && (
            <Badge variant="secondary" className="text-xs">
              Class Selected
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => clearFilter("classId")}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.gender && (
            <Badge variant="secondary" className="text-xs">
              {filters.gender}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => clearFilter("gender")}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}