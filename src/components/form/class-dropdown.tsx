import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, GraduationCap } from 'lucide-react';
import { classService, Class } from '@/services/class.service';

export interface ClassDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  academicYearId?: string; // Filter classes by academic year
  showActiveOnly?: boolean;
  className?: string;
  autoSelectSingle?: boolean; // Auto-select when only one option available
}

export const ClassDropdown: React.FC<ClassDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Select class",
  required = false,
  academicYearId,
  showActiveOnly = true,
  className,
  autoSelectSingle = true,
}) => {
  const {
    data: classResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['classes', { academicYearId, showActiveOnly }],
    queryFn: async () => {
      const filters = {
        limit: 100, // Get all classes for dropdown
        sortBy: 'name',
        sortOrder: 'asc' as const,
        ...(academicYearId && { academicYearId }),
        ...(showActiveOnly && { isActive: 'true' as const }),
      };
      return await classService.getClasses(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!academicYearId || !academicYearId, // Always enabled, but academicYearId filtering is optional
  });

  // Memoize classes to prevent unnecessary re-renders
  const classes = React.useMemo(() => {
    if (!classResponse?.data) return [];
    return classResponse.data;
  }, [classResponse?.data]);

  // Auto-select single option when enabled - use callback to prevent dependency issues
  const handleAutoSelect = React.useCallback(() => {
    if (autoSelectSingle && classes.length === 1 && !value && !isLoading) {
      const singleClass = classes[0];
      if (singleClass && singleClass._id) {
        onChange(singleClass._id);
      }
    }
  }, [autoSelectSingle, classes.length, value, isLoading, onChange]);

  React.useEffect(() => {
    handleAutoSelect();
  }, [handleAutoSelect]);

  if (error) {
    return (
      <div className="space-y-2">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load classes. 
            <button 
              onClick={() => refetch()} 
              className="ml-2 underline hover:no-underline"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />;
  }

  // Determine if dropdown should be disabled
  const isDisabled = disabled || isLoading || (autoSelectSingle && classes.length === 1);

  // Dynamic placeholder for single option
  const dynamicPlaceholder = 
    classes.length === 1 && autoSelectSingle 
      ? `${classes[0].name}${classes[0].section ? ` - ${classes[0].section}` : ''} (Auto-selected)` 
      : placeholder;

  // Format class display name
  const formatClassName = (classItem: Class) => {
    return classItem.section 
      ? `${classItem.name} - ${classItem.section}`
      : classItem.name;
  };

  return (
    <div className="space-y-1">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isDisabled}
        required={required}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={dynamicPlaceholder} />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
        </SelectTrigger>
        <SelectContent>
          {classes.length === 0 ? (
            <div className="p-2 text-sm text-gray-500 text-center">
              {academicYearId 
                ? 'No classes available for selected academic year'
                : 'No classes available'
              }
            </div>
          ) : (
            classes.map((classItem: Class) => (
              <SelectItem key={classItem._id} value={classItem._id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{formatClassName(classItem)}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {classItem.currentStudentCount !== undefined && (
                      <span className="text-xs text-gray-500">
                        {classItem.currentStudentCount}/{classItem.maxStudents}
                      </span>
                    )}
                    {classItem.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {/* Helper text for auto-selected single option */}
      {autoSelectSingle && classes.length === 1 && (
        <p className="text-xs text-gray-500">
          ℹ️ Only one class available - automatically selected
        </p>
      )}
      
      {/* Helper text when academic year is required */}
      {!academicYearId && classes.length === 0 && !isLoading && (
        <p className="text-xs text-amber-600">
          ⚠️ Select an academic year first to see available classes
        </p>
      )}
    </div>
  );
};

export default ClassDropdown;