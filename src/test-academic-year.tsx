// Simple test component to validate our implementation
import React from 'react';
import { AcademicYearDropdown } from '@/components/form/academic-year-dropdown';

const TestAcademicYear: React.FC = () => {
  const [selectedYear, setSelectedYear] = React.useState<string>('');
  const [autoSelect, setAutoSelect] = React.useState<boolean>(true);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Academic Year Dropdown Test</h2>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="autoSelect"
          checked={autoSelect}
          onChange={(e) => setAutoSelect(e.target.checked)}
        />
        <label htmlFor="autoSelect">Auto-select single option</label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Academic Year:</label>
        <AcademicYearDropdown
          value={selectedYear}
          onChange={setSelectedYear}
          placeholder="Select academic year"
          required={true}
          autoSelectSingle={autoSelect}
        />
      </div>

      {selectedYear && (
        <div className="p-2 bg-green-50 rounded border">
          <p><strong>Selected:</strong> {selectedYear}</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p><strong>Feature Test:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>If only 1 academic year exists → Auto-selects and disables dropdown</li>
          <li>If multiple exist → Normal dropdown behavior</li>
          <li>Shows helper text when auto-selected</li>
          <li>Can be toggled on/off with checkbox above</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAcademicYear;