import React from 'react';
import { ClassDropdown } from '@/components/form/class-dropdown';

interface ClassSelectorProps {
  onClassChange: (classId: string) => void;
  academicYearId?: string;
  value?: string;
}

export default function ClassSelector({ onClassChange, academicYearId, value }: ClassSelectorProps) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium">
        Select Class
      </label>
      <ClassDropdown
        value={value}
        onChange={onClassChange}
        academicYearId={academicYearId}
        placeholder="Select a class"
        showActiveOnly={true}
        autoSelectSingle={false} // Don't auto-select in attendance page
      />
    </div>
  );
}
