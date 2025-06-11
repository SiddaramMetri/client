import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { academicYearService, AcademicYear } from '@/services/academicYear.service';

export interface AcademicYearDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  showActiveOnly?: boolean;
  className?: string;
  autoSelectSingle?: boolean; // Auto-select when only one option available
}

export const AcademicYearDropdown: React.FC<AcademicYearDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Select academic year",
  required = false,
  showActiveOnly = false,
  className,
  autoSelectSingle = true,
}) => {
  const {
    data: academicYears,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['academic-years', { showActiveOnly }],
    queryFn: async () => {
      const response = await academicYearService.getAllAcademicYears();
      return showActiveOnly ? response.filter(year => year.isActive) : response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoize sorted academic years to prevent unnecessary re-renders
  const sortedAcademicYears = React.useMemo(() => {
    if (!academicYears) return [];
    
    return academicYears.sort((a, b) => {
      // Sort by start date descending (most recent first)
      const aDate = new Date(a.startDate).getTime();
      const bDate = new Date(b.startDate).getTime();
      
      // Handle invalid dates
      if (isNaN(aDate) && isNaN(bDate)) return 0;
      if (isNaN(aDate)) return 1;
      if (isNaN(bDate)) return -1;
      
      return bDate - aDate;
    });
  }, [academicYears]);

  // Auto-select single option when enabled - use callback to prevent dependency issues
  const handleAutoSelect = React.useCallback(() => {
    if (autoSelectSingle && sortedAcademicYears.length === 1 && !value && !isLoading) {
      const singleYear = sortedAcademicYears[0];
      if (singleYear && singleYear._id) {
        onChange(singleYear._id);
      }
    }
  }, [autoSelectSingle, sortedAcademicYears.length, value, isLoading, onChange]);

  React.useEffect(() => {
    handleAutoSelect();
  }, [handleAutoSelect]);

  if (error) {
    return (
      <div className="space-y-2">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load academic years. 
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
  const isDisabled = disabled || isLoading || (autoSelectSingle && sortedAcademicYears.length === 1);

  // Dynamic placeholder for single option
  const dynamicPlaceholder = 
    sortedAcademicYears.length === 1 && autoSelectSingle 
      ? `${sortedAcademicYears[0].name} (Auto-selected)` 
      : placeholder;

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
          {sortedAcademicYears.length === 0 ? (
            <div className="p-2 text-sm text-gray-500 text-center">
              No academic years available
            </div>
          ) : (
            sortedAcademicYears.map((year: AcademicYear) => (
              <SelectItem key={year._id} value={year._id}>
                <div className="flex items-center justify-between w-full">
                  <span>{year.name || 'Unnamed Academic Year'}</span>
                  {year.isActive && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {/* Helper text for auto-selected single option */}
      {autoSelectSingle && sortedAcademicYears.length === 1 && (
        <p className="text-xs text-gray-500">
          ℹ️ Only one academic year available - automatically selected
        </p>
      )}
    </div>
  );
};

export default AcademicYearDropdown;